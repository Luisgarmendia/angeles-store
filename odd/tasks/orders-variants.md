# Angeles Store's — orders, variants and stock

Objective: turn the WhatsApp-only checkout into recorded orders with status tracking, and let each product have variants (size, color, presentation) with per-variant stock and optional price.

Branch: `main`
Delivery strategy: `single-pr`
Test runner: `vitest`

## Specs

- **S1 — Variants.** A product can have zero or more variants. Each variant has a label chosen by the owner (for example "Talla M · Negro"), stock, and an optional price override. The storefront shows a selector when variants exist and adds the chosen variant to the cart.
- **S2 — Stock.** Simple products use an optional product stock (`null` means unlimited). Variant products use per-variant stock. Sold-out products show an Agotado state, and checkout revalidates stock on the server.
- **S3 — Orders.** Before opening WhatsApp, checkout records the order and its items in PostgreSQL, decrements stock in a transaction, and returns an order number. The WhatsApp message includes that number and the selected variants.
- **S4 — Admin orders.** The admin lists orders, filters by status, opens a detail, and updates the status. Cancelling an order restores stock; a cancelled order cannot be reopened.
- **S5 — Admin product stock.** The product form edits simple stock and variant rows. The product list shows stock and sold-out state.
- **S6 — Quality.** The migration is additive; existing products keep selling with unlimited stock. Pure stock/cart/order-message logic has tests, and the build/smoke test is green.
- **S7 — Gallery.** A product has a shared gallery of up to 8 images; the first is the cover used in cards, cart, orders, and sharing. Each variant has an optional image shown first when that variant is selected. The product detail shows a carousel with arrows and thumbnails. The admin edits the gallery and per-variant photo, and the migration backfills the existing cover image without losing data.

## Tasks

| ID | Specs | Route | Status | Evidence |
| --- | --- | --- | --- | --- |
| T1 | S1, S2, S6 | inline | done | `aa78bd7` · schema, migration, stock helpers, cart |
| T2 | S1, S2, S5 | inline | done | `aa78bd7` · product form variants and stock |
| T3 | S1, S2 | inline | done | `aa78bd7` · storefront selector, sold-out states |
| T4 | S3 | inline | done | `aa78bd7` · order action and WhatsApp number |
| T5 | S4 | inline | done | `aa78bd7` · admin orders list/detail/status |
| T6 | S6 | inline | done | `aa78bd7` · 45 tests, build and E2E smoke |
| T7 | S7 | inline | done | `b4220d8` · gallery manager, variant photo, carousel, migration `0002` |

## Log

- **L1 (user, verbatim):** "si creo que esos 2 son ncesarios, y creo que nos falta que un articulo pueda tener mas propierdades como las tallas color tamnio u otra caracteristica unica de cada articulo"
- **L2 (decision):** Variants use a free-form label plus stock and optional price, instead of a fixed size/color matrix. This covers sizes, colors, presentations, and one-off characteristics without a combinatorial editor. Simple products keep a nullable product stock; `null` means unlimited.
- **L3 (decision):** Orders snapshot product name, variant label, unit price, and quantity so later catalog edits do not rewrite order history. Stock is decremented inside the same transaction; checkout still opens WhatsApp after the order is recorded.
- **L4 (implementation):** `products.stock` is nullable (null means unlimited) and `product_variants` stores label, stock, optional price, and order. `orders` and `order_items` store customer data, status, and snapshots. `createOrderInDb` validates prices and stock and decrements inside a transaction; `createOrderAction` wraps it and the client opens WhatsApp with the returned order number. Admin `/admin/pedidos` lists/filters/detials orders and updates status; cancelling restores stock and a cancelled order cannot be reopened.
- **L5 (verification):** Migration `0001_narrow_bastion.sql` applied locally. `npm test` → 9 files, 45 tests passing; `tsc --noEmit` and `npm run build` green. E2E: a product with two variants was created from the admin, the storefront showed the selector, stock and sold-out variant; an order for one unit created order #1, moved variant stock 2 → 1, rejected a second order for 2 units, and cancelling from the admin restored stock 1 → 2. Test order/product were deleted afterwards.
- **L6 (deploy):** Commit `aa78bd7` pushed to `main`. The production deploy must run the new migration at start; existing products keep unlimited stock (`stock = null`) and no variants. The production catalog remains empty until products are added.
- **L7 (fix):** After moving WhatsApp behind the server action, `window.open` ran after an `await` and browsers blocked the popup even though the order was recorded. The checkout now opens an `about:blank` tab synchronously inside the submit gesture, navigates it to WhatsApp after the order succeeds, closes it on error, and falls back to same-tab navigation if the popup is blocked. Commit `9c4512f` was pushed.
- **L8 (user, verbatim):** "ok veamos lo del carrucel y deberia de poder subir por variante o como seria"
- **L9 (decision):** The gallery is shared per product (up to 8 images, first is cover) plus one optional image per variant. The variant image moves to the front of the carousel when that variant is selected; the admin can upload to R2 or paste a URL for both. This avoids duplicating the full gallery per variant while covering color/model differences.
- **L10 (implementation):** `products.images` is a JSONB string array with `products.image` kept as the cover mirror; `product_variants.image` is optional. `galleryImages` orders variant photo first and deduplicates. The admin product form manages the gallery and each variant photo; `parseImages` validates up to 8 http(s) URLs without duplicates, and variant inputs validate their photo. Migration `0002_demonic_blob.sql` adds both columns and backfills `images` from `image` for existing products.
- **L11 (verification):** Migration `0002` applied locally; 19 existing products were backfilled with their cover image. `npm test` → 10 files, 49 tests; `tsc --noEmit` and `npm run build` green. E2E: a product with 2 gallery images and 2 variants (one with photo) was created from the admin; Postgres stored `image = images[0]`, both gallery URLs, and the variant photo; the edit form showed the cover badge and both variant photo inputs; the product page rendered 3 thumbnails and both carousel arrows. Test product deleted afterwards.
