import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/server/db/db";
import { channelConnections } from "@/server/db/schema";
import { decryptToken } from "@/server/lib/meta/crypto";

const IG_API = "https://graph.instagram.com/v21.0";

/**
 * Түр debug endpoint — Instagram webhook subscription шалгах, unsubscribe, re-subscribe.
 * GET /api/debug/webhook-sub?tenantId=xxx — active connection шалгах + re-subscribe
 * GET /api/debug/webhook-sub?tenantId=xxx&action=unsub_old — disconnected connection-уудыг unsubscribe
 */
export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get("tenantId");
  const action = request.nextUrl.searchParams.get("action");
  if (!tenantId) {
    return NextResponse.json({ error: "tenantId required" }, { status: 400 });
  }

  const results: Record<string, unknown> = {};

  // Action: unsubscribe disconnected connections
  if (action === "unsub_old") {
    const oldConns = await db
      .select()
      .from(channelConnections)
      .where(
        and(
          eq(channelConnections.tenantId, tenantId),
          eq(channelConnections.platform, "instagram"),
          eq(channelConnections.status, "disconnected"),
        ),
      );

    results.disconnectedCount = oldConns.length;
    results.unsubResults = [];

    for (const old of oldConns) {
      const entry: Record<string, unknown> = {
        igAccountId: old.igAccountId,
        pageName: old.pageName,
      };
      try {
        const token = decryptToken(old.accessToken);
        // DELETE subscribed_apps → unsubscribe from webhooks
        const res = await fetch(`${IG_API}/${old.igAccountId}/subscribed_apps`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        entry.status = res.status;
        entry.body = await res.json();
      } catch (err) {
        entry.error = String(err);
      }
      (results.unsubResults as Record<string, unknown>[]).push(entry);
    }

    return NextResponse.json(results);
  }

  // Default: check + re-subscribe active connection
  const [conn] = await db
    .select()
    .from(channelConnections)
    .where(
      and(
        eq(channelConnections.tenantId, tenantId),
        eq(channelConnections.platform, "instagram"),
        eq(channelConnections.status, "active"),
      ),
    )
    .limit(1);

  if (!conn) {
    return NextResponse.json({ error: "No active Instagram connection" }, { status: 404 });
  }

  const accessToken = decryptToken(conn.accessToken);
  const igAccountId = conn.igAccountId;
  results.igAccountId = igAccountId;
  results.igUsername = conn.pageName;
  results.metadata = conn.metadata;

  // Check current subscription
  try {
    const checkRes = await fetch(`${IG_API}/${igAccountId}/subscribed_apps`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    results.checkStatus = checkRes.status;
    results.checkBody = await checkRes.json();
  } catch (err) {
    results.checkError = String(err);
  }

  // Re-subscribe
  try {
    const subRes = await fetch(
      `${IG_API}/${igAccountId}/subscribed_apps?subscribed_fields=messages`,
      { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } },
    );
    results.subscribeStatus = subRes.status;
    results.subscribeBody = await subRes.json();
  } catch (err) {
    results.subscribeError = String(err);
  }

  return NextResponse.json(results);
}
