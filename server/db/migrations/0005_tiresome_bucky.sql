-- Step 1: Convert columns to text temporarily
ALTER TABLE "subscriptions" ALTER COLUMN "plan" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "plan" SET DATA TYPE text;--> statement-breakpoint

-- Step 2: Migrate existing data to new plan names
UPDATE "tenants" SET "plan" = 'trial' WHERE "plan" = 'free';--> statement-breakpoint
UPDATE "tenants" SET "plan" = 'solo' WHERE "plan" = 'starter';--> statement-breakpoint
UPDATE "tenants" SET "plan" = 'plus' WHERE "plan" = 'growth';--> statement-breakpoint
UPDATE "tenants" SET "plan" = 'max' WHERE "plan" = 'pro';--> statement-breakpoint
UPDATE "subscriptions" SET "plan" = 'trial' WHERE "plan" = 'free';--> statement-breakpoint
UPDATE "subscriptions" SET "plan" = 'solo' WHERE "plan" = 'starter';--> statement-breakpoint
UPDATE "subscriptions" SET "plan" = 'plus' WHERE "plan" = 'growth';--> statement-breakpoint
UPDATE "subscriptions" SET "plan" = 'max' WHERE "plan" = 'pro';--> statement-breakpoint

-- Step 3: Drop old enum and create new one
DROP TYPE "public"."plan_enum";--> statement-breakpoint
CREATE TYPE "public"."plan_enum" AS ENUM('trial', 'solo', 'plus', 'max');--> statement-breakpoint

-- Step 4: Convert columns back to enum type
ALTER TABLE "tenants" ALTER COLUMN "plan" SET DEFAULT 'trial'::"public"."plan_enum";--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "plan" SET DATA TYPE "public"."plan_enum" USING "plan"::"public"."plan_enum";--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "plan" SET DATA TYPE "public"."plan_enum" USING "plan"::"public"."plan_enum";
