import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/server/db/db";
import { channelConnections } from "@/server/db/schema";
import { decryptToken } from "@/server/lib/meta/crypto";

/**
 * Түр debug endpoint — Instagram webhook subscription status шалгах + re-subscribe хийх.
 * GET /api/debug/webhook-sub?tenantId=xxx
 */
export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get("tenantId");
  if (!tenantId) {
    return NextResponse.json({ error: "tenantId required" }, { status: 400 });
  }

  // 1. Active Instagram connection олох
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
  const results: Record<string, unknown> = {
    igAccountId,
    igUsername: conn.pageName,
    metadata: conn.metadata,
  };

  // 2. Current subscription шалгах
  try {
    const checkRes = await fetch(
      `https://graph.instagram.com/v21.0/${igAccountId}/subscribed_apps`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    results.checkStatus = checkRes.status;
    results.checkBody = await checkRes.json();
  } catch (err) {
    results.checkError = String(err);
  }

  // 3. Re-subscribe хийх
  try {
    const subRes = await fetch(
      `https://graph.instagram.com/v21.0/${igAccountId}/subscribed_apps?subscribed_fields=messages`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    results.subscribeStatus = subRes.status;
    results.subscribeBody = await subRes.json();
  } catch (err) {
    results.subscribeError = String(err);
  }

  return NextResponse.json(results);
}
