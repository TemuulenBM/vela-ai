export type EventType = "product_view" | "add_to_cart" | "checkout_completed" | "chat_interaction" | "search_query";

export interface AnalyticsEvent {
  id: string;
  tenantId: string;
  shopperId: string | null;
  conversationId: string | null;
  eventType: EventType;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
