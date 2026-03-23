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

export type Channel = "web" | "messenger" | "email";
export type ConversationStatus = "active" | "resolved" | "abandoned" | "escalated";

export interface Conversation {
  id: string;
  tenantId: string;
  shopperId: string;
  channel: Channel;
  status: ConversationStatus;
  summary: string | null;
  metadata: Record<string, unknown> | null;
  rating: number | null;
  createdAt: Date;
  endedAt: Date | null;
}

// Tool result types for chat
export interface SearchProductsResult {
  id: string;
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  brand: string | null;
  stockQty: number;
  isAvailable: boolean;
  imageUrl: string | null;
}

export interface OrderStatusResult {
  orderId: string;
  status: string;
  statusText: string;
  estimatedDelivery: string;
  message: string;
}
