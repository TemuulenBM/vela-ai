import { createHmac, timingSafeEqual } from "node:crypto";

/** Meta webhook entry-ийн бүтэц */
export interface MetaWebhookEntry {
  id: string; // Page ID or IG account ID
  time: number;
  messaging: MetaMessagingEvent[];
}

export interface MetaMessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    attachments?: { type: string; payload: { url: string } }[];
  };
  postback?: {
    title: string;
    payload: string;
  };
}

export interface MetaWebhookPayload {
  object: "page" | "instagram";
  entry: MetaWebhookEntry[];
}

/**
 * X-Hub-Signature-256 header-аар webhook payload-ийг verify хийх.
 * Meta нь sha256=<hex> форматаар илгээдэг.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;

  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) throw new Error("META_APP_SECRET тохируулаагүй байна");

  const expected = "sha256=" + createHmac("sha256", appSecret).update(rawBody).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Webhook verification (GET request) — Meta subscribe хийхэд ашиглана.
 */
export function verifyWebhookSubscription(
  mode: string | null,
  token: string | null,
  challenge: string | null,
): string | null {
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;
  if (!verifyToken) throw new Error("META_WEBHOOK_VERIFY_TOKEN тохируулаагүй байна");

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return challenge;
  }
  return null;
}

/**
 * Webhook payload-аас text message events-ийг ялгаж авах.
 */
export function extractTextMessages(payload: MetaWebhookPayload): Array<{
  platform: "messenger" | "instagram";
  pageId: string;
  senderId: string;
  messageId: string;
  text: string;
}> {
  const results: Array<{
    platform: "messenger" | "instagram";
    pageId: string;
    senderId: string;
    messageId: string;
    text: string;
  }> = [];

  const platform = payload.object === "instagram" ? "instagram" : "messenger";

  for (const entry of payload.entry) {
    if (!entry.messaging) continue;
    for (const event of entry.messaging) {
      if (event.message?.text) {
        results.push({
          platform,
          pageId: entry.id,
          senderId: event.sender.id,
          messageId: event.message.mid,
          text: event.message.text,
        });
      }
    }
  }

  return results;
}
