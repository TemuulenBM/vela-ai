import { z } from "zod/v4";

// ─── Event Type Schema ────────────────────────────────────────
export const eventTypeSchema = z.enum([
  "page_view",
  "product_view",
  "add_to_cart",
  "checkout_started",
  "checkout_completed",
  "recommendation_clicked",
  "chat_interaction",
  "search_query",
]);

export type EventType = z.infer<typeof eventTypeSchema>;

// ─── Per-event Metadata Schemas ───────────────────────────────
export const pageViewMetadata = z.object({
  path: z.string(),
  referrer: z.string().optional(),
});

export const productViewMetadata = z.object({
  productId: z.string().uuid(),
  productName: z.string().optional(),
  category: z.string().optional(),
});

export const addToCartMetadata = z.object({
  productId: z.string().uuid(),
  productName: z.string().optional(),
  price: z.number().optional(),
  quantity: z.number().int().positive().default(1),
});

export const checkoutStartedMetadata = z.object({
  itemCount: z.number().int().optional(),
  totalAmount: z.number().optional(),
});

export const checkoutCompletedMetadata = z.object({
  orderId: z.string().optional(),
  totalAmount: z.number().optional(),
  itemCount: z.number().int().optional(),
});

export const searchQueryMetadata = z.object({
  query: z.string(),
  resultsCount: z.number().int().optional(),
});

// ─── Track Event Schemas ──────────────────────────────────────
export const trackEventSchema = z.object({
  tenantId: z.string().uuid(),
  sessionId: z.string().max(255),
  eventType: eventTypeSchema,
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
  shopperId: z.string().uuid().optional(),
});

export const trackEventBatchSchema = z.object({
  events: z.array(trackEventSchema).min(1).max(50),
});

export type TrackEventPayload = z.infer<typeof trackEventSchema>;
export type TrackEventBatch = z.infer<typeof trackEventBatchSchema>;
