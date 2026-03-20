import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — auth шаардлагагүй
  const publicPaths = ["/", "/login", "/register", "/api/events", "/api/chat"];
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  // API routes — session шалгах
  // TODO: NextAuth session check нэмэх
  // const session = await auth();

  // Dashboard routes хамгаалах
  if (
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/conversations") ||
    pathname.startsWith("/settings")
  ) {
    // TODO: auth check + tenant_id inject
    const response = NextResponse.next();
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
