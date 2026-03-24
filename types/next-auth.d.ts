import type { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId: string;
      role: "owner" | "admin" | "member" | "viewer";
    } & DefaultSession["user"];
  }

  interface User {
    tenantId?: string;
    role?: "owner" | "admin" | "member" | "viewer";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    tenantId?: string;
    role?: "owner" | "admin" | "member" | "viewer";
  }
}
