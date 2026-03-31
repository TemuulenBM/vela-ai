import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt, isNull, lte, isNotNull, inArray } from "drizzle-orm";
import { db } from "@/server/db/db";
import { subscriptions, tenants, tenantMembers, paymentLogs } from "@/server/db/schema";
import { createQPayInvoice, generateCallbackToken } from "@/server/lib/qpay";
import { resend, FROM_EMAIL } from "@/server/lib/resend";
import { renewalReminderEmail, pastDueEmail, downgradedEmail } from "@/server/lib/email-templates";
import {
  PLAN_PRICES_MNT,
  PLAN_LABELS,
  SUBSCRIPTION_GRACE_DAYS,
  SUBSCRIPTION_RENEWAL_REMINDER_DAYS,
  type PlanType,
} from "@/shared/lib/plan-config";

const GRACE_MS = SUBSCRIPTION_GRACE_DAYS * 24 * 60 * 60 * 1000;
const REMINDER_MS = SUBSCRIPTION_RENEWAL_REMINDER_DAYS * 24 * 60 * 60 * 1000;

// ─── Tenant-ийн owner email авах ─────────────────────────────────
async function getOwnerEmail(tenantId: string): Promise<{ email: string } | null> {
  const [member] = await db
    .select({ email: tenantMembers.email })
    .from(tenantMembers)
    .where(
      and(
        eq(tenantMembers.tenantId, tenantId),
        eq(tenantMembers.role, "owner"),
        isNull(tenantMembers.deletedAt),
      ),
    )
    .limit(1);
  return member ?? null;
}

// ─── Renewal QPay invoice үүсгэх ─────────────────────────────────
async function createRenewalInvoice(tenantId: string, plan: PlanType) {
  const amount = PLAN_PRICES_MNT[plan];
  if (!amount) return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const [newSub] = await db
    .insert(subscriptions)
    .values({
      tenantId,
      plan,
      status: "trialing",
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
    .returning({ id: subscriptions.id });

  let invoice: Awaited<ReturnType<typeof createQPayInvoice>>;
  try {
    const hmacToken = generateCallbackToken(newSub.id, tenantId);
    const callbackUrl = `${appUrl}/api/webhooks/qpay?sid=${newSub.id}&token=${hmacToken}`;
    invoice = await createQPayInvoice({
      amount,
      callbackUrl,
      senderInvoiceNo: newSub.id,
      receiverCode: tenantId,
      description: `Vela AI ${PLAN_LABELS[plan] ?? plan} багц — сунгалт`,
    });
  } catch (err) {
    // QPay алдаа гарвал orphaned sub цэвэрлэх
    await db.delete(subscriptions).where(eq(subscriptions.id, newSub.id));
    throw err;
  }

  await db
    .update(subscriptions)
    .set({ qpayInvoiceId: invoice.invoice_id, updatedAt: new Date() })
    .where(eq(subscriptions.id, newSub.id));

  await db.insert(paymentLogs).values({
    tenantId,
    subscriptionId: newSub.id,
    provider: "qpay",
    amount: String(amount),
    status: "pending",
  });

  return { subscriptionId: newSub.id, renewalUrl: `${appUrl}/settings?tab=billing` };
}

export async function GET(request: NextRequest) {
  // ─── Vercel Cron authentication ──────────────────────────────
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const upgradeUrl = `${appUrl}/settings?tab=billing`;

  const results = { downgraded: 0, markedPastDue: 0, reminders: 0, errors: 0 };

  // ════════════════════════════════════════════════════════════════
  // A. Grace period дуусаад → downgrade to trial
  //    active + canceledAt IS NULL + periodEnd + 3 days < now
  // ════════════════════════════════════════════════════════════════
  const graceDeadline = new Date(now.getTime() - GRACE_MS);
  const expiredSubs = await db
    .select({
      id: subscriptions.id,
      tenantId: subscriptions.tenantId,
      plan: subscriptions.plan,
      periodEnd: subscriptions.periodEnd,
    })
    .from(subscriptions)
    .where(
      and(
        // active эсвэл past_due — cron өмнөх өдөр past_due тэмдэглэсэн байж болно
        inArray(subscriptions.status, ["active", "past_due"]),
        isNull(subscriptions.canceledAt),
        lte(subscriptions.periodEnd, graceDeadline),
      ),
    );

  for (const sub of expiredSubs) {
    try {
      // Valid renewal sub байгаа бол downgrade хийхгүй
      const [validRenewal] = await db
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.tenantId, sub.tenantId),
            eq(subscriptions.status, "active"),
            isNull(subscriptions.canceledAt),
            gt(subscriptions.periodEnd, now),
          ),
        )
        .limit(1);

      if (validRenewal) continue;

      await db
        .update(subscriptions)
        .set({ status: "canceled", updatedAt: now })
        .where(eq(subscriptions.id, sub.id));

      await db
        .update(tenants)
        .set({ plan: "trial", updatedAt: now })
        .where(eq(tenants.id, sub.tenantId));

      // Downgrade email
      const [tenant] = await db
        .select({ name: tenants.name })
        .from(tenants)
        .where(eq(tenants.id, sub.tenantId))
        .limit(1);

      const owner = await getOwnerEmail(sub.tenantId);
      if (owner && tenant) {
        const { subject, html } = downgradedEmail({
          tenantName: tenant.name,
          oldPlan: sub.plan,
          upgradeUrl,
        });
        await resend.emails.send({ from: FROM_EMAIL, to: owner.email, subject, html });
      }

      results.downgraded++;
    } catch {
      results.errors++;
    }
  }

  // ════════════════════════════════════════════════════════════════
  // B. Grace period эхэлсэн → past_due marking + email
  //    active + canceledAt IS NULL + periodEnd < now + 3 days > now
  // ════════════════════════════════════════════════════════════════
  const pastDueSubs = await db
    .select({
      id: subscriptions.id,
      tenantId: subscriptions.tenantId,
      plan: subscriptions.plan,
      periodEnd: subscriptions.periodEnd,
    })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, "active"),
        isNull(subscriptions.canceledAt),
        lte(subscriptions.periodEnd, now),
        gt(subscriptions.periodEnd, graceDeadline),
      ),
    );

  for (const sub of pastDueSubs) {
    try {
      // Valid renewal sub байгаа бол past_due хийхгүй
      const [validRenewal] = await db
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.tenantId, sub.tenantId),
            eq(subscriptions.status, "active"),
            isNull(subscriptions.canceledAt),
            gt(subscriptions.periodEnd, now),
          ),
        )
        .limit(1);

      if (validRenewal) continue;

      await db
        .update(subscriptions)
        .set({ status: "past_due", updatedAt: now })
        .where(eq(subscriptions.id, sub.id));

      const graceEndsAt = new Date(sub.periodEnd.getTime() + GRACE_MS);
      const [tenant] = await db
        .select({ name: tenants.name })
        .from(tenants)
        .where(eq(tenants.id, sub.tenantId))
        .limit(1);

      const owner = await getOwnerEmail(sub.tenantId);
      if (owner && tenant) {
        const { subject, html } = pastDueEmail({
          tenantName: tenant.name,
          plan: sub.plan,
          renewalUrl: upgradeUrl,
          graceEndsAt,
        });
        await resend.emails.send({ from: FROM_EMAIL, to: owner.email, subject, html });
      }

      results.markedPastDue++;
    } catch {
      results.errors++;
    }
  }

  // ════════════════════════════════════════════════════════════════
  // C. 7 хоног үлдсэн → renewal invoice үүсгэх + reminder email
  //    active + canceledAt IS NULL + periodEnd BETWEEN now AND now+7days
  // ════════════════════════════════════════════════════════════════
  const reminderDeadline = new Date(now.getTime() + REMINDER_MS);
  const reminderSubs = await db
    .select({
      id: subscriptions.id,
      tenantId: subscriptions.tenantId,
      plan: subscriptions.plan,
      periodEnd: subscriptions.periodEnd,
    })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, "active"),
        isNull(subscriptions.canceledAt),
        gt(subscriptions.periodEnd, now),
        lte(subscriptions.periodEnd, reminderDeadline),
      ),
    );

  for (const sub of reminderSubs) {
    try {
      // Аль хэдийн renewal (trialing + qpayInvoiceId) invoice байвал skip
      const [pendingRenewal] = await db
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.tenantId, sub.tenantId),
            eq(subscriptions.status, "trialing"),
            isNotNull(subscriptions.qpayInvoiceId),
          ),
        )
        .limit(1);

      if (pendingRenewal) continue;

      const renewal = await createRenewalInvoice(sub.tenantId, sub.plan as PlanType);
      if (!renewal) continue;

      const [tenant] = await db
        .select({ name: tenants.name })
        .from(tenants)
        .where(eq(tenants.id, sub.tenantId))
        .limit(1);

      const owner = await getOwnerEmail(sub.tenantId);
      if (owner && tenant) {
        const { subject, html } = renewalReminderEmail({
          tenantName: tenant.name,
          plan: sub.plan,
          renewalUrl: renewal.renewalUrl,
          periodEnd: sub.periodEnd,
        });
        await resend.emails.send({ from: FROM_EMAIL, to: owner.email, subject, html });
      }

      results.reminders++;
    } catch {
      results.errors++;
    }
  }

  return NextResponse.json({ ok: true, ...results });
}
