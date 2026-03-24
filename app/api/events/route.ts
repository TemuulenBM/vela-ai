import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/db";
import { events, tenants } from "@/server/db/schema";
import {
  trackEventSchema,
  trackEventBatchSchema,
  type TrackEventPayload,
} from "@/shared/lib/event-schemas";

// In-memory rate limiter: max 100 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 100;

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

// Cleanup stale entries every 5 minutes
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
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return new Response(null, { status: 429 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    let raw: unknown;

    if (contentType.includes("application/json")) {
      raw = await request.json();
    } else {
      const text = await request.text();
      try {
        raw = JSON.parse(text);
      } catch {
        return new Response(null, { status: 204 });
      }
    }

    let eventPayloads: TrackEventPayload[];

    const batchResult = trackEventBatchSchema.safeParse(raw);
    if (batchResult.success) {
      eventPayloads = batchResult.data.events;
    } else {
      const singleResult = trackEventSchema.safeParse(raw);
      if (singleResult.success) {
        eventPayloads = [singleResult.data];
      } else {
        return new Response(null, { status: 204 });
      }
    }

    if (eventPayloads.length === 0) {
      return new Response(null, { status: 204 });
    }

    const tenantId = eventPayloads[0].tenantId;
    const allSameTenant = eventPayloads.every((e) => e.tenantId === tenantId);
    if (!allSameTenant) {
      return new Response(null, { status: 204 });
    }

    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
      columns: { id: true },
    });

    if (!tenant) {
      return new Response(null, { status: 204 });
    }

    await db.insert(events).values(
      eventPayloads.map((e) => ({
        tenantId,
        sessionId: e.sessionId,
        shopperId: e.shopperId ?? null,
        eventType: e.eventType,
        metadata: e.metadata ?? {},
      })),
    );

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[/api/events] Error processing event:", error);
    return new Response(null, { status: 204 });
  }
}
