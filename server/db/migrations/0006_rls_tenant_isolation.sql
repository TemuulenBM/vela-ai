-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0006: Row-Level Security (RLS) — Tenant isolation defense-in-depth
--
-- Adds PostgreSQL RLS policies to all 18 tenant-scoped tables.
--
-- NOTE: FORCE ROW LEVEL SECURITY is intentionally NOT used here.
-- Neon HTTP connects as the database owner role which bypasses RLS by default.
-- Adding FORCE RLS would break all mutations not wrapped in withTenantCtx
-- (auth registration, unwrapped tRPC mutations, etc.).
--
-- ENABLE RLS is sufficient:
--   • Policies protect direct DB / non-owner role access (psql, admin tools)
--   • App mutations wrapped in withTenantCtx (server/db/rls.ts) also enforce
--     these policies at DB level via SET LOCAL app.current_tenant_id
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Helper function ─────────────────────────────────────────────────────────
-- VOLATILE (not STABLE/IMMUTABLE): reads a GUC that can change per-transaction
-- so the planner must not cache the result across statements.
CREATE OR REPLACE FUNCTION app_current_tenant_id() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::uuid;
$$ LANGUAGE sql VOLATILE;

--> statement-breakpoint

-- ─── Enable RLS on all tenant-scoped tables ──────────────────────────────────
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_sell_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoppers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_connections ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint

-- ─── tenants (uses id, not tenant_id) ────────────────────────────────────────
CREATE POLICY tenant_rls_select ON tenants FOR SELECT USING (true);
CREATE POLICY tenant_rls_write ON tenants FOR ALL
  USING (id = app_current_tenant_id())
  WITH CHECK (id = app_current_tenant_id());

--> statement-breakpoint

-- ─── tenant_members ──────────────────────────────────────────────────────────
CREATE POLICY tenant_rls_select ON tenant_members FOR SELECT USING (true);
CREATE POLICY tenant_rls_write ON tenant_members FOR ALL
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

--> statement-breakpoint

-- ─── api_keys ────────────────────────────────────────────────────────────────
CREATE POLICY tenant_rls_select ON api_keys FOR SELECT USING (true);
CREATE POLICY tenant_rls_write ON api_keys FOR ALL
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

--> statement-breakpoint

-- ─── products ────────────────────────────────────────────────────────────────
CREATE POLICY tenant_rls_select ON products FOR SELECT USING (true);
CREATE POLICY tenant_rls_write ON products FOR ALL
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

--> statement-breakpoint

-- ─── product_images ──────────────────────────────────────────────────────────
CREATE POLICY tenant_rls_select ON product_images FOR SELECT USING (true);
CREATE POLICY tenant_rls_write ON product_images FOR ALL
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

--> statement-breakpoint

-- ─── orders ──────────────────────────────────────────────────────────────────
CREATE POLICY tenant_rls_select ON orders FOR SELECT USING (true);
CREATE POLICY tenant_rls_write ON orders FOR ALL
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

--> statement-breakpoint

-- ─── order_items ─────────────────────────────────────────────────────────────
CREATE POLICY tenant_rls_select ON order_items FOR SELECT USING (true);
CREATE POLICY tenant_rls_write ON order_items FOR ALL
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

--> statement-breakpoint

-- ─── returns ─────────────────────────────────────────────────────────────────
CREATE POLICY tenant_rls_select ON returns FOR SELECT USING (true);
CREATE POLICY tenant_rls_write ON returns FOR ALL
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

--> statement-breakpoint

-- ─── cross_sell_rules ────────────────────────────────────────────────────────
CREATE POLICY tenant_rls_select ON cross_sell_rules FOR SELECT USING (true);
CREATE POLICY tenant_rls_write ON cross_sell_rules FOR ALL
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

--> statement-breakpoint

-- ─── shoppers ────────────────────────────────────────────────────────────────
CREATE POLICY tenant_rls_select ON shoppers FOR SELECT USING (true);
CREATE POLICY tenant_rls_write ON shoppers FOR ALL
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

--> statement-breakpoint

-- ─── conversations ───────────────────────────────────────────────────────────
CREATE POLICY tenant_rls_select ON conversations FOR SELECT USING (true);
CREATE POLICY tenant_rls_write ON conversations FOR ALL
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

--> statement-breakpoint

-- ─── messages ────────────────────────────────────────────────────────────────
CREATE POLICY tenant_rls_select ON messages FOR SELECT USING (true);
CREATE POLICY tenant_rls_write ON messages FOR ALL
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

--> statement-breakpoint

-- ─── events ──────────────────────────────────────────────────────────────────
CREATE POLICY tenant_rls_select ON events FOR SELECT USING (true);
CREATE POLICY tenant_rls_write ON events FOR ALL
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

--> statement-breakpoint

-- ─── subscriptions ───────────────────────────────────────────────────────────
CREATE POLICY tenant_rls_select ON subscriptions FOR SELECT USING (true);
CREATE POLICY tenant_rls_write ON subscriptions FOR ALL
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

--> statement-breakpoint

-- ─── payment_logs ────────────────────────────────────────────────────────────
CREATE POLICY tenant_rls_select ON payment_logs FOR SELECT USING (true);
CREATE POLICY tenant_rls_write ON payment_logs FOR ALL
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

--> statement-breakpoint

-- ─── usage_logs ──────────────────────────────────────────────────────────────
CREATE POLICY tenant_rls_select ON usage_logs FOR SELECT USING (true);
CREATE POLICY tenant_rls_write ON usage_logs FOR ALL
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

--> statement-breakpoint

-- ─── crawl_jobs ──────────────────────────────────────────────────────────────
CREATE POLICY tenant_rls_select ON crawl_jobs FOR SELECT USING (true);
CREATE POLICY tenant_rls_write ON crawl_jobs FOR ALL
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

--> statement-breakpoint

-- ─── channel_connections ─────────────────────────────────────────────────────
CREATE POLICY tenant_rls_select ON channel_connections FOR SELECT USING (true);
CREATE POLICY tenant_rls_write ON channel_connections FOR ALL
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());
