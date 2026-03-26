import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod/v4";

/** Zod schema — webhook payload runtime validation */
const metaMessagingEventSchema = z.object({
  sender: z.object({ id: z.string() }),
  recipient: z.object({ id: z.string() }),
  timestamp: z.number(),
  message: z
    .object({
      mid: z.string(),
      text: z.string().optional(),
      is_echo: z.boolean().optional(),
      attachments: z
        .array(z.object({ type: z.string(), payload: z.object({ url: z.string() }) }))
        .optional(),
    })
    .optional(),
  postback: z.object({ title: z.string(), payload: z.string() }).optional(),
});

const metaWebhookPayloadSchema = z.object({
  object: z.enum(["page", "instagram"]),
  entry: z.array(
    z.object({
      id: z.string(),
      time: z.number(),
      messaging: z.array(metaMessagingEventSchema).max(100).optional(),
    }),
  ),
});

export type MetaWebhookPayload = z.infer<typeof metaWebhookPayloadSchema>;
export type MetaMessagingEvent = z.infer<typeof metaMessagingEventSchema>;

/**
 * Raw body-г JSON parse + Zod validate хийх.
 * Амжилтгүй бол null буцаана.
 */
export function parseWebhookPayload(rawBody: string): MetaWebhookPayload | null {
  try {
    const json = JSON.parse(rawBody);
    const result = metaWebhookPayloadSchema.safeParse(json);
    if (!result.success) {
      console.warn("[Meta Webhook] Invalid payload, issues:", result.error.issues.length);
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
    for (const event of entry.messaging) {
      // Echo messages skip (бот өөрийнхөө илгээсэн мессежийг дахин боловсруулахгүй)
      if (event.message?.is_echo) continue;
      if (event.sender.id === entry.id) continue;
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
