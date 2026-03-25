import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/db";
import { subscriptions } from "@/server/db/schema";
import { checkQPayPayment, verifyCallbackToken } from "@/server/lib/qpay";
import { activateSubscription } from "@/server/trpc/routers/payments";

/**
 * QPay webhook callback handler.
 * QPay server-to-server GET request илгээдэг.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const subscriptionId = searchParams.get("sid");
  const token = searchParams.get("token");

  if (!subscriptionId || !token) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // Subscription олох
  const [subscription] = await db
    .select({
      id: subscriptions.id,
      tenantId: subscriptions.tenantId,
      status: subscriptions.status,
      qpayInvoiceId: subscriptions.qpayInvoiceId,
      plan: subscriptions.plan,
    })
    .from(subscriptions)
    .where(eq(subscriptions.id, subscriptionId))
    .limit(1);

  if (!subscription) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // HMAC verify
  if (!verifyCallbackToken(token, subscriptionId, subscription.tenantId)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  // Аль хэдийн active бол skip
  if (subscription.status === "active") {
    return NextResponse.json({ success: true });
  }

  if (!subscription.qpayInvoiceId) {
    return NextResponse.json({ error: "No invoice" }, { status: 400 });
  }

  // QPay-аас double-verify
  const paymentResult = await checkQPayPayment(subscription.qpayInvoiceId);

  if (paymentResult.count > 0) {
    await activateSubscription(
      subscription.id,
      subscription.tenantId,
      subscription.plan,
      paymentResult,
    );
  }

  return NextResponse.json({ success: true });
}
