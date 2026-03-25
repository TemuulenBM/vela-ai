import { NextRequest, NextResponse } from "next/server";
import {
  parseOAuthState,
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  getUserPages,
} from "@/server/lib/meta/oauth";

/**
 * Facebook OAuth callback.
 * code + state авч → token exchange → pages list → redirect to settings.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // User cancelled OAuth
  if (error) {
    return NextResponse.redirect(new URL("/settings?meta_error=cancelled", origin));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/settings?meta_error=missing_params", origin));
  }

  try {
    // 1. State-аас tenantId задлах
    const { tenantId } = parseOAuthState(state);

    // 2. Code → short-lived token
    const redirectUri = `${origin}/api/auth/meta/callback`;
    const shortLivedToken = await exchangeCodeForToken(code, redirectUri);

    // 3. Short → long-lived token (60 хоног)
    const { accessToken: longLivedToken, expiresIn } =
      await exchangeForLongLivedToken(shortLivedToken);

    // 4. User-ийн pages авах
    const pages = await getUserPages(longLivedToken);

    if (pages.length === 0) {
      return NextResponse.redirect(new URL("/settings?meta_error=no_pages", origin));
    }

    // 5. Pages мэдээллийг query param-аар дамжуулах (encrypted)
    // Dashboard UI дээр page сонгох dialog гарна
    const { encryptToken } = await import("@/server/lib/meta/crypto");
    const pagesData = encryptToken(
      JSON.stringify({
        tenantId,
        pages: pages.map((p) => ({
          pageId: p.pageId,
          pageName: p.pageName,
          pageAccessToken: p.pageAccessToken,
          igAccountId: p.igAccountId,
          igUsername: p.igUsername,
        })),
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      }),
    );

    return NextResponse.redirect(
      new URL(`/settings?meta_pages=${encodeURIComponent(pagesData)}&tab=channels`, origin),
    );
  } catch (err) {
    console.error("[Meta OAuth Callback] Error:", err);
    return NextResponse.redirect(new URL("/settings?meta_error=exchange_failed", origin));
  }
}
