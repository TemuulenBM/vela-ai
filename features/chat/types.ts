export type MessageRole = "user" | "assistant" | "system" | "tool";

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  toolCalls: Record<string, unknown>[] | null;
  tokensUsed: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  tenantId: string;
  shopperId: string;
  channel: string;
  status: string;
  summary: string | null;
  metadata: Record<string, unknown> | null;
  rating: number | null;
  createdAt: Date;
  endedAt: Date | null;
}
