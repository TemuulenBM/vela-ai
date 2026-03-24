import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/api/events",
  "/api/chat",
  "/api/widget",
  "/api/webhooks",
];
const DASHBOARD_PATHS = ["/overview", "/analytics", "/products", "/conversations", "/settings"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — auth шаардлагагүй
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  // Dashboard routes — session cookie шалгах
  if (DASHBOARD_PATHS.some((p) => pathname.startsWith(p))) {
    const sessionToken =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
