ALTER TABLE "products" ADD COLUMN "made_to_order" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "compare_at_price_cents" integer;