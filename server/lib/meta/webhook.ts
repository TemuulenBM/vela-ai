import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod/v4";

/**
 * Zod schema — webhook payload runtime validation.
 * Meta нь message, delivery, read, postback, reaction, referral, optin
 * зэрэг олон event type илгээдэг тул schema маш уян байх ёстой.
 * Top-level-д зөвхөн object + entry шалгаж, бодит field шүүлт
 * extractTextMessages()-д хийгдэнэ.
 */
const metaWebhookPayloadSchema = z.looseObject({
  object: z.string(),
  entry: z
    .array(
      z.looseObject({
        id: z.string(),
        time: z.number().optional(),
        messaging: z.array(z.looseObject({})).optional(),
      }),
    )
    .max(100),
});

export type MetaWebhookPayload = z.infer<typeof metaWebhookPayloadSchema>;

/** Messaging event — extractTextMessages() дотор runtime шалгалттай ашиглана. */
export interface MetaMessagingEvent {
  sender?: { id: string };
  recipient?: { id: string };
  timestamp?: number;
  message?: {
    mid: string;
    text?: string;
    is_echo?: boolean;
  };
  postback?: { title: string; payload: string };
  [key: string]: unknown;
}

/**
 * Raw body-г JSON parse + Zod validate хийх.
 * Амжилтгүй бол null буцаана.
 */
export function parseWebhookPayload(rawBody: string): MetaWebhookPayload | null {
  try {
    const json = JSON.parse(rawBody);
    const result = metaWebhookPayloadSchema.safeParse(json);
    if (!result.success) {
      console.warn("[Meta Webhook] Invalid payload:", JSON.stringify(result.error.issues));
      return null;
    }
    return result.data;
  } catch {
    console.warn("[Meta Webhook] Failed to parse JSON");
    return null;
  }
}

/**
 * X-Hub-Signature-256 header-аар webhook payload-ийг verify хийх.
 * Meta нь sha256=<hex> форматаар илгээдэг.
 * Facebook app болон Instagram app аль алиных нь secret-ээр шалгана.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;

  const secrets = [process.env.META_APP_SECRET, process.env.META_IG_APP_SECRET].filter(
    Boolean,
  ) as string[];

  if (secrets.length === 0) throw new Error("META_APP_SECRET тохируулаагүй байна");

  for (const secret of secrets) {
    const expected = "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex");
    try {
      if (timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
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
interface TextMessage {
  platform: "messenger" | "instagram";
  pageId: string;
  senderId: string;
  messageId: string;
  text: string;
}

export function extractTextMessages(payload: MetaWebhookPayload): TextMessage[] {
  const results: TextMessage[] = [];

  const platform = payload.object === "instagram" ? "instagram" : "messenger";

  for (const entry of payload.entry) {
    if (!entry.messaging) continue;
    for (const raw of entry.messaging) {
      const event = raw as MetaMessagingEvent;
      // Шаардлагатай field байхгүй event-ийг skip
      if (!event.sender?.id || !event.message) continue;
      // Echo messages skip (бот өөрийнхөө илгээсэн мессежийг дахин боловсруулахгүй)
      if (event.message.is_echo) continue;
      if (event.sender.id === entry.id) continue;
      if (event.message.text && event.message.mid) {
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
