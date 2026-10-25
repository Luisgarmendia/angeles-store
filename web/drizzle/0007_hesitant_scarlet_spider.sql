ALTER TABLE "orders" ADD COLUMN "push_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "push_success_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "push_failure_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "push_error" text;