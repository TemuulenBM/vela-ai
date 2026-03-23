import { type NextRequest } from "next/server";
import { type UIMessage } from "ai";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/db";
import { tenants, products, events } from "@/server/db/schema";
import { authenticateChatRequest } from "@/server/lib/chat-auth";
import { executeChatPipeline, executeDemoPipeline } from "@/features/chat/lib/pipeline";
import {
  createOrGetShopper,
  createOrGetConversation,
  saveMessage,
} from "@/features/chat/lib/persistence";

// In-memory rate limiter: max 20 chat requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

if (typeof globalThis !== "undefined") {
  const cleanup = () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  };
  setInterval(cleanup, 5 * 60_000).unref?.();
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return Response.json({ error: "Хэт олон хүсэлт. Түр хүлээнэ үү." }, { status: 429 });
    }

    // 2. Parse request body
    const body = await request.json();
    const {
      messages,
      conversationId: inputConvId,
      anonymousId,
    } = body as {
      messages: UIMessage[];
      conversationId?: string;
      anonymousId?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Messages шаардлагатай." }, { status: 400 });
    }

    // 3. Check API key — if absent, run demo mode
    const authResult = await authenticateChatRequest(request);

    if (!authResult) {
      // Demo mode: platform intro bot, no tools, no persistence
      const hasApiKeyHeader = request.headers.has("x-api-key");
      if (hasApiKeyHeader) {
        return Response.json({ error: "API key буруу эсвэл дутуу байна." }, { status: 401 });
      }

      const demoResult = await executeDemoPipeline(messages);
      return demoResult.toUIMessageStreamResponse();
    }

    const { tenantId } = authResult;
    const anonId = anonymousId || "anonymous";

    // 4. Get or create shopper + conversation
    const shopperId = await createOrGetShopper(tenantId, anonId);
    const conversationId = await createOrGetConversation(tenantId, shopperId, inputConvId);

    // 5. Save the latest user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "user") {
      const textPart = lastMessage.parts.find((p) => p.type === "text");
      if (textPart && "text" in textPart) {
        await saveMessage({
          tenantId,
          conversationId,
          role: "user",
          content: textPart.text,
        });
      }
    }

    // 6. Get tenant info for system prompt
    const [tenant] = await db
      .select({ name: tenants.name })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    const categories = await db
      .selectDistinct({ category: products.category })
      .from(products)
      .where(eq(products.tenantId, tenantId));

    const productCategories = categories
      .map((c) => c.category)
      .filter((c): c is string => c !== null);

    // 7. Execute RAG pipeline
    const result = await executeChatPipeline({
      tenantId,
      tenantName: tenant?.name ?? "Дэлгүүр",
      productCategories,
      messages,
    });

    // 8. Save assistant response after stream finishes (fire-and-forget)
    (async () => {
      try {
        const text = await result.text;
        const usage = await result.totalUsage;

        if (text) {
          await saveMessage({
            tenantId,
            conversationId,
            role: "assistant",
            content: text,
            tokensUsed: usage?.totalTokens,
          });
        }

        // Track chat_interaction event
        await db.insert(events).values({
          tenantId,
          shopperId,
          conversationId,
          eventType: "chat_interaction",
          metadata: {
            messageCount: messages.length,
            tokensUsed: usage?.totalTokens,
          },
        });
      } catch {
        // Silent — don't crash on persistence failure
      }
    })();

    // 9. Return SSE stream with conversationId header
    const response = result.toUIMessageStreamResponse();
    response.headers.set("x-conversation-id", conversationId);

    return response;
  } catch (error) {
    console.error("[/api/chat] Error:", error);
    return Response.json(
      { error: "Чат системд алдаа гарлаа. Дахин оролдоно уу." },
      { status: 500 },
    );
  }
}
