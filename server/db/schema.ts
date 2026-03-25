import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  jsonb,
  pgEnum,
  primaryKey,
  uniqueIndex,
  index,
  customType,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─── Custom Types ──────────────────────────────────────────────
const vector = customType<{ data: number[]; driverParam: string }>({
  dataType() {
    return "vector(1024)";
  },
  toDriver(value: number[]) {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: unknown) {
    return (value as string).slice(1, -1).split(",").map(Number);
  },
});

// ─── Enums ─────────────────────────────────────────────────────
export const planEnum = pgEnum("plan_enum", ["free", "starter", "growth", "pro"]);

export const eventTypeEnum = pgEnum("event_type_enum", [
  "page_view",
  "product_view",
  "add_to_cart",
  "checkout_started",
  "checkout_completed",
  "recommendation_clicked",
  "chat_interaction",
  "search_query",
]);

export const channelEnum = pgEnum("channel_enum", ["web", "messenger", "email"]);

export const convStatusEnum = pgEnum("conv_status_enum", [
  "active",
  "resolved",
  "abandoned",
  "escalated",
]);

export const subStatusEnum = pgEnum("sub_status_enum", [
  "active",
  "past_due",
  "canceled",
  "trialing",
]);

export const paymentProviderEnum = pgEnum("payment_provider", ["qpay", "socialpay"]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "success",
  "failed",
  "refunded",
]);

export const memberRoleEnum = pgEnum("member_role", ["owner", "admin", "member", "viewer"]);

export const messageRoleEnum = pgEnum("message_role", ["user", "assistant", "system", "tool"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const returnStatusEnum = pgEnum("return_status", [
  "pending",
  "approved",
  "rejected",
  "completed",
]);

// ─── CORE ──────────────────────────────────────────────────────
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  plan: planEnum("plan").notNull().default("free"),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const tenantMembers = pgTable("tenant_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  email: varchar("email", { length: 255 }).notNull(),
  userId: uuid("user_id"),
  role: memberRoleEnum("role").notNull().default("member"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  name: varchar("name", { length: 255 }).notNull(),
  keyHash: varchar("key_hash", { length: 255 }).notNull(),
  keyPrefix: varchar("key_prefix", { length: 10 }).notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── PRODUCTS ──────────────────────────────────────────────────
export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    externalId: varchar("external_id", { length: 255 }),
    name: varchar("name", { length: 500 }).notNull(),
    description: text("description"),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    category: varchar("category", { length: 255 }),
    brand: varchar("brand", { length: 255 }),
    stockQty: integer("stock_qty").notNull().default(0),
    isAvailable: boolean("is_available").notNull().default(true),
    metadata: jsonb("metadata"),
    embedding: vector("embedding"),
    embeddingText: text("embedding_text"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("products_tenant_id_idx").on(table.tenantId),
    index("products_embedding_idx").using("hnsw", sql`${table.embedding} vector_cosine_ops`),
    index("products_tenant_category_idx")
      .on(table.tenantId, table.category)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);

export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  url: text("url").notNull(),
  altText: varchar("alt_text", { length: 1000 }),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── AUTH (NextAuth v5) ────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: varchar("token_type", { length: 255 }),
    scope: text("scope"),
    idToken: text("id_token"),
  },
  (table) => [uniqueIndex("accounts_provider_idx").on(table.provider, table.providerAccountId)],
);

export const sessions = pgTable("sessions", {
  sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
  userId: uuid("user_id").notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
);

// ─── CHAT ──────────────────────────────────────────────────────
export const shoppers = pgTable(
  "shoppers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    sessionId: uuid("session_id"),
    anonymousId: varchar("anonymous_id", { length: 255 }),
    mergedIntoId: uuid("merged_into_id"),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }),
    metadata: jsonb("metadata"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("shoppers_tenant_id_idx").on(table.tenantId)],
);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    shopperId: uuid("shopper_id")
      .notNull()
      .references(() => shoppers.id),
    channel: channelEnum("channel").notNull().default("web"),
    status: convStatusEnum("status").notNull().default("active"),
    summary: text("summary"),
    metadata: jsonb("metadata"),
    rating: integer("rating"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
  },
  (table) => [
    index("conversations_tenant_id_idx").on(table.tenantId),
    index("conversations_shopper_id_idx").on(table.shopperId),
    index("conversations_tenant_status_created_idx").on(
      table.tenantId,
      table.status,
      table.createdAt,
    ),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id),
    role: messageRoleEnum("role").notNull(),
    content: text("content"),
    toolCalls: jsonb("tool_calls"),
    tokensUsed: integer("tokens_used"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("messages_conversation_id_idx").on(table.conversationId),
    index("messages_conversation_created_idx").on(table.conversationId, table.createdAt),
  ],
);

// ─── ANALYTICS ─────────────────────────────────────────────────
export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    shopperId: uuid("shopper_id").references(() => shoppers.id),
    conversationId: uuid("conversation_id").references(() => conversations.id),
    sessionId: varchar("session_id", { length: 255 }),
    eventType: eventTypeEnum("event_type").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("events_tenant_id_idx").on(table.tenantId),
    index("events_event_type_idx").on(table.eventType),
    index("events_created_at_idx").on(table.createdAt),
    index("events_tenant_type_created_idx").on(table.tenantId, table.eventType, table.createdAt),
    index("events_tenant_session_idx").on(table.tenantId, table.sessionId),
  ],
);

// ─── INTELLIGENCE ──────────────────────────────────────────────
export const crossSellRules = pgTable(
  "cross_sell_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    triggerProductId: uuid("trigger_product_id")
      .notNull()
      .references(() => products.id),
    recommendedProductId: uuid("recommended_product_id")
      .notNull()
      .references(() => products.id),
    confidence: numeric("confidence", { precision: 5, scale: 4 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("cross_sell_unique_idx").on(
      table.tenantId,
      table.triggerProductId,
      table.recommendedProductId,
    ),
  ],
);

// ─── BILLING ───────────────────────────────────────────────────
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    plan: planEnum("plan").notNull(),
    status: subStatusEnum("status").notNull().default("active"),
    qpayInvoiceId: varchar("qpay_invoice_id", { length: 255 }),
    socialPayId: varchar("social_pay_id", { length: 255 }),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("subscriptions_tenant_id_idx").on(table.tenantId)],
);

export const paymentLogs = pgTable("payment_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  subscriptionId: uuid("subscription_id")
    .notNull()
    .references(() => subscriptions.id),
  provider: paymentProviderEnum("provider").notNull(),
  providerTxId: varchar("provider_tx_id", { length: 255 }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  currency: varchar("currency", { length: 3 }).notNull().default("MNT"),
  rawResponse: jsonb("raw_response"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usageLogs = pgTable(
  "usage_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    periodMonth: varchar("period_month", { length: 7 }).notNull(), // "2026-03"
    conversationsCount: integer("conversations_count").notNull().default(0),
    messagesCount: integer("messages_count").notNull().default(0),
    embeddingCalls: integer("embedding_calls").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("usage_logs_tenant_month_idx").on(table.tenantId, table.periodMonth)],
);

// ─── ORDERS ───────────────────────────────────────────────────
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    shopperId: uuid("shopper_id")
      .notNull()
      .references(() => shoppers.id),
    orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
    status: orderStatusEnum("status").notNull().default("pending"),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    shippingAddress: jsonb("shipping_address"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("orders_tenant_id_idx").on(table.tenantId),
    index("orders_order_number_idx").on(table.orderNumber),
  ],
);

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── RETURNS ──────────────────────────────────────────────────
export const returns = pgTable(
  "returns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),
    returnNumber: varchar("return_number", { length: 50 }).notNull().unique(),
    reason: text("reason").notNull(),
    status: returnStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("returns_tenant_id_idx").on(table.tenantId),
    index("returns_return_number_idx").on(table.returnNumber),
  ],
);
