import { after, NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/server/db/db";
import { channelConnections, tenants, products, events, messages } from "@/server/db/schema";
import {
  verifyWebhookSignature,
  verifyWebhookSubscription,
  extractTextMessages,
  parseWebhookPayload,
} from "@/server/lib/meta/webhook";
import { sendMetaMessage, IG_GRAPH_API_BASE } from "@/server/lib/meta/api";
import { decryptToken } from "@/server/lib/meta/crypto";
import { executeChatPipeline } from "@/features/chat/lib/pipeline";
import {
  createOrGetMetaShopper,
  createOrGetConversation,
  saveMessage,
  getConversationMessages,
} from "@/features/chat/lib/persistence";
import type { UIMessage } from "ai";

export const maxDuration = 60;

// Mid-based deduplication (prevent processing Meta retries)
const processedMids = new Map<string, number>();
const DEDUP_TTL = 5 * 60_000;

// Rate limiting — per IP, 60 req/min (зөвхөн verified request тоолно)
const webhookRateMap = new Map<string, { count: number; resetAt: number }>();
const WEBHOOK_RATE_WINDOW = 60_000;
const WEBHOOK_RATE_LIMIT = 60;

function isWebhookRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = webhookRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    webhookRateMap.set(ip, { count: 1, resetAt: now + WEBHOOK_RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > WEBHOOK_RATE_LIMIT;
}

// Cleanup stale entries periodically
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [mid, ts] of processedMids) {
      if (now - ts > DEDUP_TTL) processedMids.delete(mid);
    }
    for (const [key, val] of webhookRateMap) {
      if (now > val.resetAt) webhookRateMap.delete(key);
    }
  }, 60_000).unref?.();
}

/**
 * GET — Meta webhook verification (subscribe хийхэд).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const result = verifyWebhookSubscription(mode, token, challenge);

  if (result) {
    return new NextResponse(result, { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

/**
 * POST — Meta incoming messages webhook.
 * 200 шууд буцааж, processing-ийг after()-аар async хийнэ.
 */
export async function POST(request: NextRequest) {
  // 0. Бүх incoming request лог (signature verify-ийн ӨМНӨ)
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  console.log(
    `[WH-RAW] len=${rawBody.length} sig=${signature ? "yes" : "no"} body=${rawBody.slice(0, 200)}`,
  );

  // 1. Signature verify (rate limit-ийн ӨМНӨ — зөвхөн verified request тоолно)
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn(`[WH-RAW] SIGNATURE FAILED`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  // 2. Rate limit (signature verify-ийн ДАРАА)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isWebhookRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // 3. Payload parse + validate
  const payload = parseWebhookPayload(rawBody);
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  console.log("[Meta Webhook] object:", payload.object, "entries:", payload.entry?.length);

  // 4. Text messages + dedup
  for (const entry of payload.entry) {
    const evtCount = entry.messaging?.length ?? 0;
    console.log(`[WH] entry=${entry.id} msgs=${evtCount}`);
    if (entry.messaging) {
      for (const raw of entry.messaging) {
        const keys = Object.keys(raw as Record<string, unknown>);
        console.log(`[WH] evt keys=${keys.join(",")}`);
        const e = raw as Record<string, unknown>;
        if (e.sender) console.log(`[WH] sender=${JSON.stringify(e.sender)}`);
        if (e.message) console.log(`[WH] message=${JSON.stringify(e.message)}`);
        if (!e.sender) console.log(`[WH] NO SENDER in event`);
        if (!e.message) console.log(`[WH] NO MESSAGE field`);
      }
    }
  }
  const textMessages = extractTextMessages(payload);
  console.log(`[WH] extracted=${textMessages.length}`);
  const messagesToProcess = textMessages.filter((msg) => {
    if (processedMids.has(msg.messageId)) return false;
    processedMids.set(msg.messageId, Date.now());
    return true;
  });

  // 5. after() — response буцаасны дараа background-д processing үргэлжилнэ
  if (messagesToProcess.length > 0) {
    after(async () => {
      for (const msg of messagesToProcess) {
        try {
          await processIncomingMessage(msg);
        } catch (err) {
          console.error("[Meta Webhook] Processing error:", err);
        }
      }
    });
  }

  return NextResponse.json({ status: "ok" });
}

// ─── Types ──────────────────────────────────────────────────────────

interface IncomingMessage {
  platform: "messenger" | "instagram";
  pageId: string;
  senderId: string;
  messageId: string;
  text: string;
}

// ─── Connection helpers ─────────────────────────────────────────────

/** pageId (Messenger) эсвэл igAccountId (Instagram)-аар active connection олох. */
async function findActiveConnection(msg: IncomingMessage) {
  const idColumn =
    msg.platform === "instagram" ? channelConnections.igAccountId : channelConnections.pageId;

  const [connection] = await db
    .select({
      id: channelConnections.id,
      tenantId: channelConnections.tenantId,
      accessToken: channelConnections.accessToken,
      platform: channelConnections.platform,
      metadata: channelConnections.metadata,
      tokenExpiresAt: channelConnections.tokenExpiresAt,
    })
    .from(channelConnections)
    .where(
      and(
        eq(idColumn, msg.pageId),
        eq(channelConnections.platform, msg.platform),
        eq(channelConnections.status, "active"),
      ),
    )
    .limit(1);

  return connection ?? null;
}

type ActiveConnection = NonNullable<Awaited<ReturnType<typeof findActiveConnection>>>;

/** Token expire болсон эсэхийг шалгаж, expire бол status update хийнэ. */
async function validateToken(connection: ActiveConnection): Promise<string | null> {
  if (connection.tokenExpiresAt) {
    const now = new Date();
    if (now > connection.tokenExpiresAt) {
      console.warn(`[Meta Webhook] Token expired for tenantId=${connection.tenantId}`);
      await db
        .update(channelConnections)
        .set({ status: "token_expired" })
        .where(eq(channelConnections.id, connection.id));
      return null;
    }
    const daysLeft = (connection.tokenExpiresAt.getTime() - now.getTime()) / 86_400_000;
    if (daysLeft < 7) {
      console.warn(
        `[Meta Webhook] Token expires in ${Math.round(daysLeft)}d, tenant=${connection.tenantId}`,
      );
    }
  }

  try {
    return decryptToken(connection.accessToken);
  } catch (err) {
    console.error(`[Meta Webhook] Decrypt failed for tenantId=${connection.tenantId}:`, err);
    return null;
  }
}

/** Connection metadata-аас authType-ийг аюулгүй задлах. */
function getApiBase(metadata: unknown): string | undefined {
  if (metadata && typeof metadata === "object" && "authType" in metadata) {
    return (metadata as { authType: string }).authType === "instagram_login"
      ? IG_GRAPH_API_BASE
      : undefined;
  }
  return undefined;
}

// ─── Chat helpers ───────────────────────────────────────────────────

/** Conversation history-г UIMessage[] руу хөрвүүлэх. */
function toUIMessages(history: Awaited<ReturnType<typeof getConversationMessages>>): UIMessage[] {
  return history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content ?? "",
      parts: [{ type: "text" as const, text: m.content ?? "" }],
      createdAt: m.createdAt,
    }));
}

/** RAG pipeline ажиллуулж хариу авах. */
async function generateResponse(tenantId: string, conversationId: string) {
  const [tenant] = await db
    .select({ name: tenants.name })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  const categories = await db
    .selectDistinct({ category: products.category })
    .from(products)
    .where(eq(products.tenantId, tenantId));

  const history = await getConversationMessages(conversationId, tenantId);

  const result = await executeChatPipeline({
    tenantId,
    tenantName: tenant?.name ?? "Дэлгүүр",
    productCategories: categories.map((c) => c.category).filter((c): c is string => c !== null),
    messages: toUIMessages(history),
  });

  const text = await result.text;
  const usage = await result.totalUsage;
  console.log(
    `[Meta Webhook] Pipeline done: len=${text?.length ?? 0}, tokens=${usage?.totalTokens}`,
  );

  return { text, tokensUsed: usage?.totalTokens };
}

// ─── Main processing ────────────────────────────────────────────────

async function processIncomingMessage(msg: IncomingMessage) {
  // 1. Connection + token
  const connection = await findActiveConnection(msg);
  if (!connection) {
    console.warn(`[Meta Webhook] No connection: pageId=${msg.pageId}, platform=${msg.platform}`);
    return;
  }

  const { tenantId } = connection;
  const pageAccessToken = await validateToken(connection);
  if (!pageAccessToken) return;

  // 2. DB-level dedup — ижил meta mid аль хэдийн боловсруулагдсан эсэхийг шалгах
  const [existing] = await db
    .select({ id: messages.id })
    .from(messages)
    .where(sql`${messages.metadata}->>'metaMid' = ${msg.messageId}`)
    .limit(1);

  if (existing) {
    console.log(`[Meta Webhook] Duplicate mid=${msg.messageId}, skipping`);
    return;
  }

  // 3. Shopper + conversation + user message хадгалах
  const shopperId = await createOrGetMetaShopper(tenantId, msg.platform, msg.senderId);
  const conversationId = await createOrGetConversation(
    tenantId,
    shopperId,
    undefined,
    msg.platform,
  );
  await saveMessage({
    tenantId,
    conversationId,
    role: "user",
    content: msg.text,
    metadata: { metaMid: msg.messageId },
  });

  // 4. RAG pipeline → хариу
  const { text: responseText, tokensUsed } = await generateResponse(tenantId, conversationId);

  if (responseText) {
    await saveMessage({
      tenantId,
      conversationId,
      role: "assistant",
      content: responseText,
      tokensUsed,
    });
  }

  // 4. Meta API-аар хариу илгээх
  await sendMetaMessage({
    recipientId: msg.senderId,
    text: responseText || "Уучлаарай, хариулж чадахгүй байна.",
    pageAccessToken,
    platform: msg.platform,
    apiBase: getApiBase(connection.metadata),
  });

  // 5. Analytics
  await db.insert(events).values({
    tenantId,
    shopperId,
    conversationId,
    eventType: "chat_interaction",
    metadata: { channel: msg.platform, tokensUsed },
  });
}
