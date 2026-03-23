import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/db";
import { events, tenants } from "@/server/db/schema";
import {
  trackEventSchema,
  trackEventBatchSchema,
  type TrackEventPayload,
} from "@/features/analytics/lib/events";

export async function POST(request: NextRequest) {
  try {
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

    // C1 fix: Batch доторх бүх event ижил tenantId-тай байх ёстой
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
