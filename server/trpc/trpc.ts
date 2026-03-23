import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { auth } from "@/server/auth/auth";

export async function createContext() {
  const session = await auth();

  return {
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const tenantId = ctx.session.user.tenantId;
  if (!tenantId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Tenant not found for user",
    });
  }

  return next({
    ctx: {
      session: ctx.session,
      tenantId,
    },
  });
});
