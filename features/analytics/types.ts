export type EventType =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "checkout_started"
  | "checkout_completed"
  | "recommendation_clicked"
  | "chat_interaction"
  | "search_query";

export interface AnalyticsEvent {
  id: string;
  tenantId: string;
  shopperId: string | null;
  conversationId: string | null;
  sessionId: string | null;
  eventType: EventType;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
