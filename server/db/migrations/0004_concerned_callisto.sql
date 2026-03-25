CREATE TYPE "public"."channel_connection_status" AS ENUM('active', 'disconnected', 'token_expired');--> statement-breakpoint
CREATE TYPE "public"."channel_platform" AS ENUM('messenger', 'instagram');--> statement-breakpoint
ALTER TYPE "public"."channel_enum" ADD VALUE 'instagram' BEFORE 'email';--> statement-breakpoint
CREATE TABLE "channel_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"platform" "channel_platform" NOT NULL,
	"page_id" varchar(255) NOT NULL,
	"page_name" varchar(500),
	"ig_account_id" varchar(255),
	"ig_username" varchar(255),
	"access_token" text NOT NULL,
	"token_expires_at" timestamp with time zone,
	"catalog_id" varchar(255),
	"last_sync_at" timestamp with time zone,
	"status" "channel_connection_status" DEFAULT 'active' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"disconnected_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "channel_connections" ADD CONSTRAINT "channel_connections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "channel_connections_tenant_idx" ON "channel_connections" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "channel_connections_tenant_page_platform_uniq" ON "channel_connections" USING btree ("tenant_id","page_id","platform");--> statement-breakpoint
CREATE INDEX "channel_connections_page_id_idx" ON "channel_connections" USING btree ("page_id");