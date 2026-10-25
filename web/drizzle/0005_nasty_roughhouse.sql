CREATE TYPE "public"."admin_role" AS ENUM('owner', 'staff');--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "role" "admin_role" DEFAULT 'staff' NOT NULL;--> statement-breakpoint
UPDATE "admin_users" SET "role" = 'owner';