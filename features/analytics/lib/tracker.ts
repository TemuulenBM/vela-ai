import type { TrackEventPayload } from "./events";

const EVENTS_ENDPOINT = "/api/events";
const MAX_QUEUE_SIZE = 10;
const SESSION_KEY = "vela_session_id";

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `sess_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  }
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "sess_";
  for (let i = 0; i < 16; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";

  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export interface TrackerConfig {
  tenantId: string;
  endpoint?: string;
}

export interface Tracker {
  trackPageView(metadata: { path: string; referrer?: string }): void;
  trackProductView(metadata: { productId: string; productName?: string; category?: string }): void;
  trackAddToCart(metadata: {
    productId: string;
    productName?: string;
    price?: number;
    quantity?: number;
  }): void;
  trackCheckoutCompleted(metadata: {
    orderId?: string;
    totalAmount?: number;
    itemCount?: number;
  }): void;
  track(eventType: TrackEventPayload["eventType"], metadata?: Record<string, unknown>): void;
  flush(): void;
  destroy(): void;
}

export function createTracker(config: TrackerConfig): Tracker {
  const { tenantId, endpoint = EVENTS_ENDPOINT } = config;
  const queue: TrackEventPayload[] = [];
  let destroyed = false;

  function enqueue(
    eventType: TrackEventPayload["eventType"],
    metadata: Record<string, unknown> = {},
  ) {
    if (destroyed) return;
    queue.push({
      tenantId,
      sessionId: getSessionId(),
      eventType,
      metadata,
    });

    if (queue.length >= MAX_QUEUE_SIZE) {
      flush();
    }
  }

  function flush() {
    if (queue.length === 0) return;

    const batch = queue.splice(0);
    const payload = JSON.stringify({ events: batch });

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      const sent = navigator.sendBeacon(endpoint, blob);
      if (!sent) {
        sendViaFetch(payload);
      }
    } else {
      sendViaFetch(payload);
    }
  }

  function sendViaFetch(payload: string) {
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // fire-and-forget
    });
  }

  function handleBeforeUnload() {
    flush();
  }

  function handleVisibilityChange() {
    if (document.visibilityState === "hidden") {
      flush();
    }
  }

  function attachListeners() {
    if (typeof window === "undefined") return;
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  function destroy() {
    destroyed = true;
    flush();
    if (typeof window !== "undefined") {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  }

  attachListeners();

  return {
    trackPageView(metadata) {
      enqueue("page_view", metadata as Record<string, unknown>);
    },
    trackProductView(metadata) {
      enqueue("product_view", metadata as Record<string, unknown>);
    },
    trackAddToCart(metadata) {
      enqueue("add_to_cart", metadata as Record<string, unknown>);
    },
    trackCheckoutCompleted(metadata) {
      enqueue("checkout_completed", metadata as Record<string, unknown>);
    },
    track: enqueue,
    flush,
    destroy,
  };
}

// SSR-safe no-op tracker
export const noopTracker: Tracker = {
  trackPageView() {},
  trackProductView() {},
  trackAddToCart() {},
  trackCheckoutCompleted() {},
  track() {},
  flush() {},
  destroy() {},
};
