// Re-export from shared to maintain feature-internal imports
export {
  eventTypeSchema,
  type EventType,
  pageViewMetadata,
  productViewMetadata,
  addToCartMetadata,
  checkoutStartedMetadata,
  checkoutCompletedMetadata,
  searchQueryMetadata,
  trackEventSchema,
  trackEventBatchSchema,
  type TrackEventPayload,
  type TrackEventBatch,
} from "@/shared/lib/event-schemas";
