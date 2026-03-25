import { encryptToken, decryptToken } from "./crypto";

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

interface MetaPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string };
}

export interface MetaPageInfo {
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  igAccountId?: string;
  igUsername?: string;
}

/**
 * Facebook OAuth URL үүсгэх.
 * state parameter-т tenantId encrypt хийж дамжуулна.
 */
export function buildOAuthUrl(tenantId: string, redirectUri: string): string {
  const appId = process.env.META_APP_ID;
  if (!appId) throw new Error("META_APP_ID тохируулаагүй байна");

  const state = encryptToken(JSON.stringify({ tenantId, ts: Date.now() }));

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: "pages_messaging,pages_manage_metadata,pages_show_list,instagram_manage_messages",
    response_type: "code",
    state,
  });

  return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
}

/**
 * OAuth state parameter-аас tenantId-г задлах.
 */
export function parseOAuthState(state: string): { tenantId: string } {
  const decrypted = decryptToken(state);
  const parsed = JSON.parse(decrypted) as { tenantId: string; ts: number };

  // 10 минутын дотор байх ёстой
  if (Date.now() - parsed.ts > 10 * 60_000) {
    throw new Error("OAuth state expired");
  }

  return { tenantId: parsed.tenantId };
}

/**
 * OAuth code-ийг access token руу солих.
 */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) throw new Error("META_APP_ID/SECRET тохируулаагүй");

  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetch(`${GRAPH_API_BASE}/oauth/access_token?${params.toString()}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/**
 * Short-lived token-ийг long-lived token руу солих (60 хоног).
 */
export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) throw new Error("META_APP_ID/SECRET тохируулаагүй");

  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLivedToken,
  });

  const res = await fetch(`${GRAPH_API_BASE}/oauth/access_token?${params.toString()}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Long-lived token exchange failed: ${err}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

/**
 * User-ийн manage хийж буй Facebook Page-үүдийг авах.
 * Page access token + linked IG account-тай.
 */
export async function getUserPages(userAccessToken: string): Promise<MetaPageInfo[]> {
  const res = await fetch(
    `${GRAPH_API_BASE}/me/accounts?fields=id,name,access_token,instagram_business_account`,
    { headers: { Authorization: `Bearer ${userAccessToken}` } },
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch pages: ${err}`);
  }

  const data = (await res.json()) as { data: MetaPage[] };
  const pages: MetaPageInfo[] = [];

  for (const page of data.data) {
    const info: MetaPageInfo = {
      pageId: page.id,
      pageName: page.name,
      pageAccessToken: page.access_token,
      igAccountId: page.instagram_business_account?.id,
    };

    // IG username авах (хэрэв linked account байвал)
    if (info.igAccountId) {
      try {
        const igRes = await fetch(`${GRAPH_API_BASE}/${info.igAccountId}?fields=username`, {
          headers: { Authorization: `Bearer ${userAccessToken}` },
        });
        if (igRes.ok) {
          const igData = (await igRes.json()) as { username?: string };
          info.igUsername = igData.username;
        }
      } catch {
        // IG username авч чадахгүй байвал skip
      }
    }

    pages.push(info);
  }

  return pages;
}

/**
 * Page-ийг webhook-д subscribe хийх.
 */
export async function subscribePageToWebhook(
  pageId: string,
  pageAccessToken: string,
): Promise<void> {
  const res = await fetch(
    `${GRAPH_API_BASE}/${pageId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${pageAccessToken}` },
    },
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to subscribe page: ${err}`);
  }
}
