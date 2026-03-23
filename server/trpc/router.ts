import { router } from "./trpc";
import { analyticsRouter } from "./routers/analytics";

export const appRouter = router({
  analytics: analyticsRouter,
  // products: productsRouter,
  // conversations: conversationsRouter,
  // tenants: tenantsRouter,
});

export type AppRouter = typeof appRouter;
