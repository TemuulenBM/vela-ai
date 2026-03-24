import { router } from "./trpc";
import { analyticsRouter } from "./routers/analytics";
import { productsRouter } from "./routers/products";
import { chatRouter } from "./routers/chat";
import { tenantsRouter } from "./routers/tenants";

export const appRouter = router({
  analytics: analyticsRouter,
  products: productsRouter,
  chat: chatRouter,
  tenants: tenantsRouter,
});

export type AppRouter = typeof appRouter;
