import { and, eq, desc } from "drizzle-orm";
import { db } from "@/server/db/db";
import { shoppers, conversations, messages } from "@/server/db/schema";

/**
 * Find or create a shopper by anonymousId for the given tenant.
 */
export async function createOrGetShopper(tenantId: string, anonymousId: string): Promise<string> {
  // Try to find existing shopper
  const [existing] = await db
    .select({ id: shoppers.id })
    .from(shoppers)
    .where(and(eq(shoppers.tenantId, tenantId), eq(shoppers.anonymousId, anonymousId)))
    .limit(1);

  if (existing) return existing.id;

  // Create new shopper (with retry on race condition)
  try {
    const [created] = await db
      .insert(shoppers)
      .values({ tenantId, anonymousId })
      .returning({ id: shoppers.id });
    return created.id;
  } catch {
    // Race condition: another request created the same shopper — re-fetch
    const [raced] = await db
      .select({ id: shoppers.id })
      .from(shoppers)
      .where(and(eq(shoppers.tenantId, tenantId), eq(shoppers.anonymousId, anonymousId)))
      .limit(1);
    if (raced) return raced.id;
    throw new Error("Failed to create or find shopper");
  }
}

/**
 * Find an active conversation for the shopper, or create a new one.
 * If conversationId is provided, verify it belongs to the tenant.
 */
export async function createOrGetConversation(
  tenantId: string,
  shopperId: string,
  conversationId?: string,
): Promise<string> {
  // If conversationId provided, verify ownership
  if (conversationId) {
    const [existing] = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.tenantId, tenantId),
          eq(conversations.shopperId, shopperId),
        ),
      )
      .limit(1);

    if (existing) return existing.id;
  }

  // Find most recent active conversation
  const [active] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      and(
        eq(conversations.tenantId, tenantId),
        eq(conversations.shopperId, shopperId),
        eq(conversations.status, "active"),
      ),
    )
    .orderBy(desc(conversations.createdAt))
    .limit(1);

  if (active) return active.id;

  // Create new conversation
  const [created] = await db
    .insert(conversations)
    .values({
      tenantId,
      shopperId,
      channel: "web",
      status: "active",
    })
    .returning({ id: conversations.id });

  return created.id;
}

/**
 * Save a message to the database.
 */
export async function saveMessage(params: {
  tenantId: string;
  conversationId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string | null;
  toolCalls?: unknown[];
  tokensUsed?: number;
}): Promise<string> {
  const [msg] = await db
    .insert(messages)
    .values({
      tenantId: params.tenantId,
      conversationId: params.conversationId,
      role: params.role,
      content: params.content,
      toolCalls: params.toolCalls ?? null,
      tokensUsed: params.tokensUsed ?? null,
    })
    .returning({ id: messages.id });

  return msg.id;
}

/**
 * Get conversation messages ordered by creation time.
 */
export async function getConversationMessages(
  conversationId: string,
  tenantId: string,
  limit = 50,
) {
  return db
    .select({
      id: messages.id,
      role: messages.role,
      content: messages.content,
      toolCalls: messages.toolCalls,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(and(eq(messages.conversationId, conversationId), eq(messages.tenantId, tenantId)))
    .orderBy(messages.createdAt)
    .limit(limit);
}
