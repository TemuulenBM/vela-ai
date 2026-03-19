import { router } from "./trpc";

export const appRouter = router({
  // Feature routers дараа нэмнэ:
  // analytics: analyticsRouter,
  // products: productsRouter,
  // conversations: conversationsRouter,
  // tenants: tenantsRouter,
});

export type AppRouter = typeof appRouter;
