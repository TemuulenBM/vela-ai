import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/server/db/db";
import { channelConnections, crawlJobs } from "@/server/db/schema";
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

  // Action: check sync job + test IG media API
  if (action === "check_sync") {
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

    // Latest crawl job
    const [latestJob] = await db
      .select({
        id: crawlJobs.id,
        status: crawlJobs.status,
        totalFound: crawlJobs.totalFound,
        totalImported: crawlJobs.totalImported,
        totalUpdated: crawlJobs.totalUpdated,
        totalSkipped: crawlJobs.totalSkipped,
        cursor: crawlJobs.cursor,
        error: crawlJobs.error,
        config: crawlJobs.config,
        websiteUrl: crawlJobs.websiteUrl,
        createdAt: crawlJobs.createdAt,
        completedAt: crawlJobs.completedAt,
      })
      .from(crawlJobs)
      .where(eq(crawlJobs.tenantId, tenantId))
      .orderBy(desc(crawlJobs.createdAt))
      .limit(1);

    // Test IG media API directly
    let mediaTest: Record<string, unknown> = {};
    try {
      const token = decryptToken(conn.accessToken);
      const url = `https://graph.instagram.com/v21.0/me/media?fields=id,caption,media_type,timestamp&limit=3&access_token=${token}`;
      const res = await fetch(url);
      mediaTest.status = res.status;
      mediaTest.body = await res.json();
    } catch (err) {
      mediaTest.error = String(err);
    }

    return NextResponse.json({
      connection: {
        id: conn.id,
        igAccountId: conn.igAccountId,
        igUsername: conn.pageName,
        platform: conn.platform,
        status: conn.status,
      },
      latestJob,
      mediaApiTest: mediaTest,
    });
  }

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

  // Also check: send test message via Graph API to verify token works
  const action2 = request.nextUrl.searchParams.get("test_send");
  if (action2) {
    try {
      const sendRes = await fetch(`${IG_API}/me/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: { id: action2 },
          message: { text: "Vela AI тест мессеж 🎉" },
        }),
      });
      results.sendTestStatus = sendRes.status;
      results.sendTestBody = await sendRes.json();
    } catch (err) {
      results.sendTestError = String(err);
    }
  }

  return NextResponse.json(results);
}
