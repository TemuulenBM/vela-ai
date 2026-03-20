CREATE TYPE "public"."channel_enum" AS ENUM('web', 'messenger', 'email');--> statement-breakpoint
CREATE TYPE "public"."conv_status_enum" AS ENUM('active', 'resolved', 'abandoned', 'escalated');--> statement-breakpoint
CREATE TYPE "public"."sub_status_enum" AS ENUM('active', 'past_due', 'canceled', 'trialing');--> statement-breakpoint
ALTER TYPE "public"."event_type_enum" ADD VALUE 'page_view' BEFORE 'product_view';--> statement-breakpoint
ALTER TYPE "public"."event_type_enum" ADD VALUE 'checkout_started' BEFORE 'checkout_completed';--> statement-breakpoint
ALTER TYPE "public"."event_type_enum" ADD VALUE 'recommendation_clicked' BEFORE 'chat_interaction';--> statement-breakpoint
ALTER TABLE "tenant_members" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tenant_members" ALTER COLUMN "role" SET DEFAULT 'member'::text;--> statement-breakpoint
DROP TYPE "public"."member_role";--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('owner', 'admin', 'member', 'viewer');--> statement-breakpoint
ALTER TABLE "tenant_members" ALTER COLUMN "role" SET DEFAULT 'member'::"public"."member_role";--> statement-breakpoint
ALTER TABLE "tenant_members" ALTER COLUMN "role" SET DATA TYPE "public"."member_role" USING "role"::"public"."member_role";--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "channel" SET DEFAULT 'web'::"public"."channel_enum";--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "channel" SET DATA TYPE "public"."channel_enum" USING "channel"::"public"."channel_enum";--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."conv_status_enum";--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "status" SET DATA TYPE "public"."conv_status_enum" USING "status"::"public"."conv_status_enum";--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."sub_status_enum";--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DATA TYPE "public"."sub_status_enum" USING "status"::"public"."sub_status_enum";--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "session_id" varchar(255);--> statement-breakpoint
ALTER TABLE "payment_logs" ADD COLUMN "status" "payment_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
CREATE INDEX "conversations_tenant_status_created_idx" ON "conversations" USING btree ("tenant_id","status","created_at");--> statement-breakpoint
CREATE INDEX "events_tenant_type_created_idx" ON "events" USING btree ("tenant_id","event_type","created_at");--> statement-breakpoint
CREATE INDEX "events_tenant_session_idx" ON "events" USING btree ("tenant_id","session_id");--> statement-breakpoint
CREATE INDEX "messages_conversation_created_idx" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "products_embedding_idx" ON "products" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "products_tenant_category_idx" ON "products" USING btree ("tenant_id","category") WHERE "products"."deleted_at" IS NULL;