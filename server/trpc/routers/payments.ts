import { z } from "zod/v4";
import { and, eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { db } from "@/server/db/db";
import { tenants, subscriptions, paymentLogs } from "@/server/db/schema";
import { PLAN_PRICES_MNT, PLAN_LABELS, type PlanType } from "@/shared/lib/plan-config";
import { createQPayInvoice, checkQPayPayment, generateCallbackToken } from "@/server/lib/qpay";

const planInput = z.enum(["starter", "growth", "pro"]);

// ─── Shared helper: subscription activate ──────────────────────
export async function activateSubscription(
  subscriptionId: string,
  tenantId: string,
  plan: PlanType,
  paymentResult: Awaited<ReturnType<typeof checkQPayPayment>>,
) {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 30);

  // Subscription activate (race condition guard: WHERE status = 'trialing')
  await db
    .update(subscriptions)
    .set({ status: "active", periodStart: now, periodEnd, updatedAt: now })
    .where(and(eq(subscriptions.id, subscriptionId), eq(subscriptions.status, "trialing")));

  // Tenant plan update
  await db.update(tenants).set({ plan, updatedAt: now }).where(eq(tenants.id, tenantId));

  // Payment log update
  const firstPayment = paymentResult.rows[0];
  await db
    .update(paymentLogs)
    .set({
      status: "success",
      providerTxId: firstPayment ? String(firstPayment.payment_id) : null,
      rawResponse: paymentResult,
    })
    .where(and(eq(paymentLogs.subscriptionId, subscriptionId), eq(paymentLogs.status, "pending")));
}

export const paymentsRouter = router({
  // ─── Invoice үүсгэх ────────────────────────────────────────────
  createInvoice: protectedProcedure
    .input(z.object({ plan: planInput }))
    .mutation(async ({ ctx, input }) => {
      // Одоогийн plan шалгах
      const [tenant] = await db
        .select({ plan: tenants.plan, name: tenants.name })
        .from(tenants)
        .where(eq(tenants.id, ctx.tenantId))
        .limit(1);

      if (!tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tenant олдсонгүй" });
      }

      if (tenant.plan === input.plan) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Та аль хэдийн энэ багцыг ашиглаж байна",
        });
      }

      // Pending (trialing) subscription байгаа эсэх шалгах
      const [pendingSub] = await db
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(and(eq(subscriptions.tenantId, ctx.tenantId), eq(subscriptions.status, "trialing")))
        .limit(1);

      if (pendingSub) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Төлбөр хүлээгдэж буй захиалга байна. Эхлээд төлбөрөө хийнэ үү.",
        });
      }

      const amount = PLAN_PRICES_MNT[input.plan];
      if (!amount) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Буруу багц" });
      }

      // Subscription үүсгэх (trialing = pending)
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setDate(periodEnd.getDate() + 30);

      const [subscription] = await db
        .insert(subscriptions)
        .values({
          tenantId: ctx.tenantId,
          plan: input.plan,
          status: "trialing",
          periodStart: now,
          periodEnd,
        })
        .returning({ id: subscriptions.id });

      // HMAC token — webhook security
      const hmacToken = generateCallbackToken(subscription.id, ctx.tenantId);

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const callbackUrl = `${appUrl}/api/webhooks/qpay?sid=${subscription.id}&token=${hmacToken}`;

      // QPay invoice
      const invoice = await createQPayInvoice({
        amount,
        callbackUrl,
        senderInvoiceNo: subscription.id,
        receiverCode: ctx.tenantId,
        description: `Vela AI ${PLAN_LABELS[input.plan]} багц — 1 сар`,
      });

      // subscription-д invoiceId хадгалах
      await db
        .update(subscriptions)
        .set({ qpayInvoiceId: invoice.invoice_id, updatedAt: new Date() })
        .where(eq(subscriptions.id, subscription.id));

      // Payment log
      await db.insert(paymentLogs).values({
        tenantId: ctx.tenantId,
        subscriptionId: subscription.id,
        provider: "qpay",
        amount: String(amount),
        status: "pending",
      });

      return {
        subscriptionId: subscription.id,
        invoiceId: invoice.invoice_id,
        qrImage: invoice.qr_image,
        qrText: invoice.qr_text,
        urls: invoice.urls,
      };
    }),

  // ─── Төлбөр шалгах ─────────────────────────────────────────────
  checkPayment: protectedProcedure
    .input(z.object({ subscriptionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [subscription] = await db
        .select({
          id: subscriptions.id,
          status: subscriptions.status,
          qpayInvoiceId: subscriptions.qpayInvoiceId,
          plan: subscriptions.plan,
        })
        .from(subscriptions)
        .where(
          and(eq(subscriptions.id, input.subscriptionId), eq(subscriptions.tenantId, ctx.tenantId)),
        )
        .limit(1);

      if (!subscription) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription олдсонгүй" });
      }

      // Аль хэдийн active бол шалгахгүй
      if (subscription.status === "active") {
        return { paid: true };
      }

      if (!subscription.qpayInvoiceId) {
        return { paid: false };
      }

      // QPay-аас шалгах
      const paymentResult = await checkQPayPayment(subscription.qpayInvoiceId);

      if (paymentResult.count > 0) {
        await activateSubscription(subscription.id, ctx.tenantId, subscription.plan, paymentResult);
        return { paid: true };
      }

      return { paid: false };
    }),

  // ─── Төлбөрийн түүх ────────────────────────────────────────────
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    const logs = await db
      .select({
        id: paymentLogs.id,
        plan: subscriptions.plan,
        amount: paymentLogs.amount,
        status: paymentLogs.status,
        currency: paymentLogs.currency,
        providerTxId: paymentLogs.providerTxId,
        createdAt: paymentLogs.createdAt,
      })
      .from(paymentLogs)
      .innerJoin(subscriptions, eq(paymentLogs.subscriptionId, subscriptions.id))
      .where(eq(paymentLogs.tenantId, ctx.tenantId))
      .orderBy(desc(paymentLogs.createdAt))
      .limit(50);

    return logs;
  }),

  // ─── Идэвхтэй subscription ───────────────────────────────────────
  getActiveSubscription: protectedProcedure.query(async ({ ctx }) => {
    const [sub] = await db
      .select({
        id: subscriptions.id,
        plan: subscriptions.plan,
        status: subscriptions.status,
        periodStart: subscriptions.periodStart,
        periodEnd: subscriptions.periodEnd,
      })
      .from(subscriptions)
      .where(and(eq(subscriptions.tenantId, ctx.tenantId), eq(subscriptions.status, "active")))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    return sub ?? null;
  }),

  // ─── Subscription цуцлах ────────────────────────────────────────
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const now = new Date();

    // Active subscription олох
    const [subscription] = await db
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(and(eq(subscriptions.tenantId, ctx.tenantId), eq(subscriptions.status, "active")))
      .limit(1);

    if (!subscription) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Идэвхтэй захиалга олдсонгүй",
      });
    }

    // Subscription цуцлах
    await db
      .update(subscriptions)
      .set({ status: "canceled", canceledAt: now, updatedAt: now })
      .where(eq(subscriptions.id, subscription.id));

    // Tenant → free plan
    await db
      .update(tenants)
      .set({ plan: "free", updatedAt: now })
      .where(eq(tenants.id, ctx.tenantId));

    return { success: true };
  }),
});
