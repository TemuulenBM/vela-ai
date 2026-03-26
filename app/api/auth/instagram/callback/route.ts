import { NextRequest, NextResponse } from "next/server";
import {
  parseOAuthState,
  exchangeInstagramCode,
  exchangeInstagramLongLivedToken,
  getInstagramUserInfo,
} from "@/server/lib/meta/oauth";

/**
 * Instagram Login OAuth callback.
 * code + state → token exchange → user info → redirect to settings.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/settings?ig_error=cancelled&tab=channels", origin));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/settings?ig_error=missing_params&tab=channels", origin));
  }

  try {
    // 1. State-аас tenantId задлах
    const { tenantId } = parseOAuthState(state);
    console.log("[Instagram OAuth] tenantId:", tenantId);

    // 2. Code → short-lived token + user_id
    const redirectUri = `${origin}/api/auth/instagram/callback`;
    console.log("[Instagram OAuth] redirectUri:", redirectUri);
    const { accessToken: shortToken, userId } = await exchangeInstagramCode(code, redirectUri);
    console.log("[Instagram OAuth] got short token for userId:", userId);

    // 3. Short → long-lived token (60 хоног)
    const { accessToken: longLivedToken, expiresIn } =
      await exchangeInstagramLongLivedToken(shortToken);

    // 4. Username авах
    const userInfo = await getInstagramUserInfo(longLivedToken);

    // 5. Encrypted data → redirect
    const { encryptToken } = await import("@/server/lib/meta/crypto");
    const igData = encryptToken(
      JSON.stringify({
        tenantId,
        igUserId: userInfo.userId || userId,
        igUsername: userInfo.username,
        accessToken: longLivedToken,
        tokenExpiresAt: new Date(Date.now() + (expiresIn || 5_184_000) * 1000).toISOString(),
      }),
    );

    return NextResponse.redirect(
      new URL(`/settings?ig_data=${encodeURIComponent(igData)}&tab=channels`, origin),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Instagram OAuth Callback] Error:", message);
    return NextResponse.redirect(
      new URL(`/settings?ig_error=${encodeURIComponent(message)}&tab=channels`, origin),
    );
  }
}
