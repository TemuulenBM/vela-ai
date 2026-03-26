import { router } from "./trpc";
import { analyticsRouter } from "./routers/analytics";
import { productsRouter } from "./routers/products";
import { chatRouter } from "./routers/chat";
import { tenantsRouter } from "./routers/tenants";
import { paymentsRouter } from "./routers/payments";
import { crawlerRouter } from "./routers/crawler";
import { channelsRouter } from "./routers/channels";

export const appRouter = router({
  analytics: analyticsRouter,
  products: productsRouter,
  chat: chatRouter,
  tenants: tenantsRouter,
  payments: paymentsRouter,
  crawler: crawlerRouter,
  channels: channelsRouter,
});

export type AppRouter = typeof appRouter;
