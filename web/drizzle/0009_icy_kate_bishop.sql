CREATE INDEX "products_active_sort_idx" ON "products" USING btree ("active","sort_order","created_at","id");--> statement-breakpoint
CREATE INDEX "products_active_created_idx" ON "products" USING btree ("active","created_at","id");--> statement-breakpoint
CREATE INDEX "products_active_price_idx" ON "products" USING btree ("active","price_cents","id");--> statement-breakpoint
CREATE INDEX "products_active_category_idx" ON "products" USING btree ("active","category");