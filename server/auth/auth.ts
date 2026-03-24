import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/db";
import { users, tenantMembers } from "@/server/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Имэйл", type: "email" },
        password: { label: "Нууц үг", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });

        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);

        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;

        const member = await db.query.tenantMembers.findFirst({
          where: eq(tenantMembers.userId, user.id),
        });

        if (member) {
          token.tenantId = member.tenantId;
          token.role = member.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      if (token?.tenantId) {
        session.user.tenantId = token.tenantId as string;
      }
      if (token?.role) {
        session.user.role = token.role as "owner" | "admin" | "member" | "viewer";
      }
      return session;
    },
  },
});
