import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/server/db/db";
import { channelConnections, tenants, products, events } from "@/server/db/schema";
import {
  verifyWebhookSignature,
  verifyWebhookSubscription,
  extractTextMessages,
  type MetaWebhookPayload,
} from "@/server/lib/meta/webhook";
import { sendMetaMessage } from "@/server/lib/meta/api";
import { decryptToken } from "@/server/lib/meta/crypto";
import { executeChatPipeline } from "@/features/chat/lib/pipeline";
import {
  createOrGetMetaShopper,
  createOrGetConversation,
  saveMessage,
  getConversationMessages,
} from "@/features/chat/lib/persistence";
import type { UIMessage } from "ai";

// Mid-based deduplication (prevent processing Meta retries)
const processedMids = new Map<string, number>();
const DEDUP_TTL = 5 * 60_000; // 5 минут

// Cleanup stale entries periodically
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [mid, ts] of processedMids) {
      if (now - ts > DEDUP_TTL) processedMids.delete(mid);
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
 * 200 шууд буцааж, processing-ийг async хийнэ.
 */
export async function POST(request: NextRequest) {
  // 1. Raw body авах + signature verify
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const payload = JSON.parse(rawBody) as MetaWebhookPayload;

  // 2. Text messages-ийг ялгаж авах
  const textMessages = extractTextMessages(payload);

  // 3. Fire-and-forget async processing — 200 шууд буцаана
  for (const msg of textMessages) {
    // Deduplication check
    if (processedMids.has(msg.messageId)) continue;
    processedMids.set(msg.messageId, Date.now());

    // Async process (don't await — Meta needs 200 within 5s)
    processIncomingMessage(msg).catch((err) => {
      console.error("[Meta Webhook] Processing error:", err);
    });
  }

  return NextResponse.json({ status: "ok" });
}

interface IncomingMessage {
  platform: "messenger" | "instagram";
  pageId: string;
  senderId: string;
  messageId: string;
  text: string;
}

/** pageId + platform-аар active connection олох. */
async function findActiveConnection(msg: IncomingMessage) {
  const [connection] = await db
    .select({
      id: channelConnections.id,
      tenantId: channelConnections.tenantId,
      accessToken: channelConnections.accessToken,
      platform: channelConnections.platform,
    })
    .from(channelConnections)
    .where(
      and(
        eq(channelConnections.pageId, msg.pageId),
        eq(channelConnections.platform, msg.platform),
        eq(channelConnections.status, "active"),
      ),
    )
    .limit(1);

  return connection ?? null;
}

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

/** Tenant-ийн нэр + бүтээгдэхүүний ангилал авах. */
async function getTenantContext(tenantId: string) {
  const [tenant] = await db
    .select({ name: tenants.name })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  const categories = await db
    .selectDistinct({ category: products.category })
    .from(products)
    .where(eq(products.tenantId, tenantId));

  return {
    tenantName: tenant?.name ?? "Дэлгүүр",
    productCategories: categories.map((c) => c.category).filter((c): c is string => c !== null),
  };
}

async function processIncomingMessage(msg: IncomingMessage) {
  // 1. Connection олох
  const connection = await findActiveConnection(msg);
  if (!connection) {
    console.warn(`[Meta Webhook] No active connection for pageId=${msg.pageId}`);
    return;
  }

  const { tenantId } = connection;
  const pageAccessToken = decryptToken(connection.accessToken);

  // 2. Shopper + conversation
  const shopperId = await createOrGetMetaShopper(tenantId, msg.platform, msg.senderId);
  const conversationId = await createOrGetConversation(
    tenantId,
    shopperId,
    undefined,
    msg.platform,
  );

  // 3. User message хадгалах + history авах
  await saveMessage({ tenantId, conversationId, role: "user", content: msg.text });
  const history = await getConversationMessages(conversationId, tenantId);

  // 4. RAG pipeline
  const { tenantName, productCategories } = await getTenantContext(tenantId);
  const result = await executeChatPipeline({
    tenantId,
    tenantName,
    productCategories,
    messages: toUIMessages(history),
  });

  const responseText = await result.text;
  const usage = await result.totalUsage;

  // 5. Хариу хадгалах + илгээх
  if (responseText) {
    await saveMessage({
      tenantId,
      conversationId,
      role: "assistant",
      content: responseText,
      tokensUsed: usage?.totalTokens,
    });
  }

  await sendMetaMessage({
    recipientId: msg.senderId,
    text: responseText || "Уучлаарай, хариулж чадахгүй байна.",
    pageAccessToken,
    platform: msg.platform,
  });

  // 6. Analytics event
  await db.insert(events).values({
    tenantId,
    shopperId,
    conversationId,
    eventType: "chat_interaction",
    metadata: { channel: msg.platform, tokensUsed: usage?.totalTokens },
  });
}
