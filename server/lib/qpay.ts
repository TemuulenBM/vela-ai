import { createHmac, timingSafeEqual } from "crypto";
import { useQpay } from "@mnpay/qpay";
import type {
  CreateInvoiceRequestParams,
  InvoiceResponse,
  PaymentCheckResponse,
} from "@mnpay/qpay";

// ---------------------------------------------------------------------------
// QPay singleton
// ---------------------------------------------------------------------------

let instance: ReturnType<typeof useQpay> | null = null;

function getQPay() {
  if (!instance) {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- useQpay is a QPay SDK factory, not a React hook
    instance = useQpay({
      username: process.env.QPAY_USERNAME!,
      password: process.env.QPAY_PASSWORD!,
      baseUrl: process.env.QPAY_BASE_URL || "https://merchant.qpay.mn",
      version: "v2",
    });
  }
  return instance;
}

// ---------------------------------------------------------------------------
// Auth — QPay token авах
// ---------------------------------------------------------------------------

export async function authenticateQPay() {
  const qpay = getQPay();
  const res = await qpay.authenticate({
    username: process.env.QPAY_USERNAME!,
    password: process.env.QPAY_PASSWORD!,
  });
  return res.data;
}

// ---------------------------------------------------------------------------
// Invoice үүсгэх
// ---------------------------------------------------------------------------

export async function createQPayInvoice(params: {
  amount: number;
  callbackUrl: string;
  senderInvoiceNo: string;
  receiverCode: string;
  description: string;
}): Promise<InvoiceResponse> {
  await authenticateQPay();
  const qpay = getQPay();

  const invoiceData: CreateInvoiceRequestParams = {
    invoice_code: process.env.QPAY_INVOICE_CODE!,
    sender_invoice_no: params.senderInvoiceNo,
    invoice_receiver_code: params.receiverCode,
    invoice_description: params.description,
    amount: params.amount,
    calback_url: params.callbackUrl,
  };

  const res = await qpay.createInvoice(invoiceData);
  return res.data;
}

// ---------------------------------------------------------------------------
// Төлбөр шалгах
// ---------------------------------------------------------------------------

export async function checkQPayPayment(invoiceId: string): Promise<PaymentCheckResponse> {
  await authenticateQPay();
  const qpay = getQPay();

  const res = await qpay.checkPayment({
    object_type: "INVOICE",
    object_id: invoiceId,
  });
  return res.data;
}

// ---------------------------------------------------------------------------
// Invoice цуцлах
// ---------------------------------------------------------------------------

export async function cancelQPayInvoice(invoiceId: string) {
  await authenticateQPay();
  const qpay = getQPay();

  const res = await qpay.cancelInvoice({ invoice_id: invoiceId });
  return res.data;
}

// ---------------------------------------------------------------------------
// HMAC — webhook callback security
// ---------------------------------------------------------------------------

const HMAC_SECRET = process.env.QPAY_PASSWORD!;

export function generateCallbackToken(subscriptionId: string, tenantId: string): string {
  return createHmac("sha256", HMAC_SECRET).update(`${subscriptionId}:${tenantId}`).digest("hex");
}

export function verifyCallbackToken(
  token: string,
  subscriptionId: string,
  tenantId: string,
): boolean {
  const expected = generateCallbackToken(subscriptionId, tenantId);
  if (token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
