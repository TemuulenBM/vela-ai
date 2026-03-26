import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { db } from "@/server/db/db";
import { channelConnections } from "@/server/db/schema";
import { encryptToken, decryptToken } from "@/server/lib/meta/crypto";
import {
  buildOAuthUrl,
  buildInstagramOAuthUrl,
  subscribePageToWebhook,
  subscribeInstagramToWebhook,
} from "@/server/lib/meta/oauth";
import { getPageCatalogs, syncCatalogProducts } from "@/server/lib/meta/catalog";

/** Encrypted pages data-г задалж parsed object буцаана. */
function decryptPagesData(pagesData: string, tenantId: string) {
  let parsed: {
    tenantId: string;
    pages: Array<{
      pageId: string;
      pageName: string;
      pageAccessToken: string;
      igAccountId?: string;
      igUsername?: string;
    }>;
    tokenExpiresAt: string;
  };

  try {
    parsed = JSON.parse(decryptToken(pagesData));
  } catch {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Буруу pages data" });
  }

  if (parsed.tenantId !== tenantId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Tenant таарахгүй байна" });
  }

  return parsed;
}

/** Channel connection upsert хийнэ (Messenger/Instagram ижил логик). */
async function upsertConnection(params: {
  tenantId: string;
  platform: "messenger" | "instagram";
  pageId: string;
  pageName: string;
  igAccountId?: string;
  igUsername?: string;
  encryptedToken: string;
  tokenExpiresAt: Date;
  metadata?: Record<string, unknown>;
}) {
  const [conn] = await db
    .insert(channelConnections)
    .values({
      tenantId: params.tenantId,
      platform: params.platform,
      pageId: params.pageId,
      pageName: params.pageName,
      igAccountId: params.igAccountId,
      igUsername: params.igUsername,
      accessToken: params.encryptedToken,
      tokenExpiresAt: params.tokenExpiresAt,
      metadata: params.metadata,
      status: "active",
    })
    .onConflictDoUpdate({
      target: [channelConnections.tenantId, channelConnections.pageId, channelConnections.platform],
      set: {
        pageName: params.pageName,
        accessToken: params.encryptedToken,
        tokenExpiresAt: params.tokenExpiresAt,
        igAccountId: params.igAccountId,
        igUsername: params.igUsername,
        metadata: params.metadata,
        status: "active",
        disconnectedAt: null,
        updatedAt: new Date(),
      },
    })
    .returning({ id: channelConnections.id });

  return conn.id;
}

/** Instagram callback encrypted data задлах + tenant шалгах. */
interface ParsedInstagramData {
  tenantId: string;
  igUserId: string;
  igUsername: string;
  accessToken: string;
  tokenExpiresAt: string;
}

function decryptInstagramPayload(igData: string, tenantId: string): ParsedInstagramData {
  let parsed: ParsedInstagramData;
  try {
    parsed = JSON.parse(decryptToken(igData));
  } catch {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Буруу Instagram data" });
  }
  if (parsed.tenantId !== tenantId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Tenant таарахгүй байна" });
  }
  return parsed;
}

/** Connection олох + tenant verify. */
async function findConnection(connectionId: string, tenantId: string) {
  const [connection] = await db
    .select({
      id: channelConnections.id,
      pageId: channelConnections.pageId,
      accessToken: channelConnections.accessToken,
      status: channelConnections.status,
    })
    .from(channelConnections)
    .where(and(eq(channelConnections.id, connectionId), eq(channelConnections.tenantId, tenantId)))
    .limit(1);

  if (!connection) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Connection олдсонгүй" });
  }
  if (connection.status !== "active") {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Connection идэвхгүй байна" });
  }

  return connection;
}

export const channelsRouter = router({
  /**
   * Tenant-ийн бүх channel connections.
   */
  listConnections: protectedProcedure.query(async ({ ctx }) => {
    const connections = await db
      .select({
        id: channelConnections.id,
        platform: channelConnections.platform,
        pageId: channelConnections.pageId,
        pageName: channelConnections.pageName,
        igAccountId: channelConnections.igAccountId,
        igUsername: channelConnections.igUsername,
        status: channelConnections.status,
        catalogId: channelConnections.catalogId,
        lastSyncAt: channelConnections.lastSyncAt,
        createdAt: channelConnections.createdAt,
        updatedAt: channelConnections.updatedAt,
      })
      .from(channelConnections)
      .where(eq(channelConnections.tenantId, ctx.tenantId));

    return connections;
  }),

  /**
   * Facebook OAuth URL авах.
   */
  getMetaOAuthUrl: protectedProcedure
    .input(z.object({ redirectUri: z.string().url() }))
    .query(({ ctx, input }) => {
      return { url: buildOAuthUrl(ctx.tenantId, input.redirectUri) };
    }),

  /**
   * Encrypted pages data-г задлаж page жагсаалт буцаана.
   * UI-д page select dialog-д хэрэглэнэ.
   */
  decryptPages: protectedProcedure
    .input(z.object({ pagesData: z.string() }))
    .query(({ ctx, input }) => {
      const parsed = decryptPagesData(input.pagesData, ctx.tenantId);
      return {
        pages: parsed.pages.map((p) => ({
          pageId: p.pageId,
          pageName: p.pageName,
          igAccountId: p.igAccountId,
          igUsername: p.igUsername,
        })),
      };
    }),

  /**
   * OAuth callback-аас ирсэн page-ийг холбох.
   * pagesData нь encrypted JSON — callback route-аас дамжсан.
   */
  connectPage: protectedProcedure
    .input(
      z.object({
        pagesData: z.string(),
        selectedPageId: z.string(),
        connectInstagram: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const parsed = decryptPagesData(input.pagesData, ctx.tenantId);

      const selectedPage = parsed.pages.find((p) => p.pageId === input.selectedPageId);
      if (!selectedPage) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Page олдсонгүй" });
      }

      // Subscribe page to webhooks
      await subscribePageToWebhook(selectedPage.pageId, selectedPage.pageAccessToken);

      const encryptedToken = encryptToken(selectedPage.pageAccessToken);
      const tokenExpiresAt = new Date(parsed.tokenExpiresAt);

      const common = {
        tenantId: ctx.tenantId,
        pageId: selectedPage.pageId,
        pageName: selectedPage.pageName,
        igAccountId: selectedPage.igAccountId,
        igUsername: selectedPage.igUsername,
        encryptedToken,
        tokenExpiresAt,
      };

      // Messenger connection
      const messengerConnectionId = await upsertConnection({
        ...common,
        platform: "messenger",
      });

      // Instagram connection (if opted in + IG account exists)
      let igConnectionId: string | null = null;
      if (input.connectInstagram && selectedPage.igAccountId) {
        // Subscribe IG account to webhooks for DM messages
        await subscribeInstagramToWebhook(selectedPage.igAccountId, selectedPage.pageAccessToken);

        igConnectionId = await upsertConnection({
          ...common,
          platform: "instagram",
        });
      }

      return {
        messengerConnectionId,
        igConnectionId,
        pageName: selectedPage.pageName,
      };
    }),

  /**
   * Page-д холбогдсон FB Catalog-уудыг авах.
   */
  getPageCatalogs: protectedProcedure
    .input(z.object({ connectionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const connection = await findConnection(input.connectionId, ctx.tenantId);
      const token = decryptToken(connection.accessToken);
      return getPageCatalogs(connection.pageId, token);
    }),

  /**
   * FB Catalog-аас бүтээгдэхүүнүүдийг sync хийх.
   */
  syncCatalog: protectedProcedure
    .input(
      z.object({
        connectionId: z.string().uuid(),
        catalogId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const connection = await findConnection(input.connectionId, ctx.tenantId);
      const token = decryptToken(connection.accessToken);

      const result = await syncCatalogProducts({
        tenantId: ctx.tenantId,
        catalogId: input.catalogId,
        pageAccessToken: token,
      });

      // Connection-д catalogId + lastSyncAt хадгалах
      await db
        .update(channelConnections)
        .set({
          catalogId: input.catalogId,
          lastSyncAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(channelConnections.id, input.connectionId));

      return result;
    }),

  // ─────────────────────────────────────────────
  // Instagram Login OAuth (IG-only дэлгүүрүүдэд)
  // ─────────────────────────────────────────────

  /**
   * Instagram Login OAuth URL авах.
   */
  getInstagramOAuthUrl: protectedProcedure
    .input(z.object({ redirectUri: z.string().url() }))
    .query(({ ctx, input }) => {
      return { url: buildInstagramOAuthUrl(ctx.tenantId, input.redirectUri) };
    }),

  /**
   * Instagram callback-аас ирсэн encrypted data задлах.
   */
  decryptInstagramData: protectedProcedure
    .input(z.object({ igData: z.string() }))
    .query(({ ctx, input }) => {
      const parsed = decryptInstagramPayload(input.igData, ctx.tenantId);
      return { igUserId: parsed.igUserId, igUsername: parsed.igUsername };
    }),

  /**
   * Instagram Login-аар холбох (IG-only, Facebook Page шаардахгүй).
   */
  connectInstagram: protectedProcedure
    .input(z.object({ igData: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const parsed = decryptInstagramPayload(input.igData, ctx.tenantId);

      // Subscribe IG account to webhooks
      await subscribeInstagramToWebhook(parsed.igUserId, parsed.accessToken);

      const connectionId = await upsertConnection({
        tenantId: ctx.tenantId,
        platform: "instagram",
        pageId: parsed.igUserId,
        pageName: `@${parsed.igUsername}`,
        igAccountId: parsed.igUserId,
        igUsername: parsed.igUsername,
        encryptedToken: encryptToken(parsed.accessToken),
        tokenExpiresAt: new Date(parsed.tokenExpiresAt),
        metadata: { authType: "instagram_login" },
      });

      return { connectionId, igUsername: parsed.igUsername };
    }),

  /**
   * Channel connection салгах.
   */
  disconnect: protectedProcedure
    .input(z.object({ connectionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(channelConnections)
        .set({
          status: "disconnected",
          disconnectedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(channelConnections.id, input.connectionId),
            eq(channelConnections.tenantId, ctx.tenantId),
          ),
        )
        .returning({ id: channelConnections.id });

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Connection олдсонгүй" });
      }

      return { success: true };
    }),
});
