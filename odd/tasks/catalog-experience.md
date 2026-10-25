# Angeles Store's — Catalog experience (made-to-order, discounts, filters, badges)

Objective: enrich the storefront catalog with made-to-order products, price-range filtering, sorting by insertion date or price, and attractive discount/sold-out/status badges on product cards.

Branch: `feat/catalog-experience`
Delivery strategy: `single-pr`
Test runner: `vitest` (`cd web && npm test`)

## Specs

- **S1 — Made-to-order products.** Products carry a `porEncargo` flag, editable in the admin. Storefront cards and the product detail show a "Por encargo" badge/notice. Made-to-order products are always orderable: stock is not tracked or decremented for them.
- **S2 — Catalog filters.** The catalog offers a price range (minimum and maximum, in lempiras) and sorting by insertion date (newest first) or price (lowest/highest), with the existing featured order as default. Search and category filters keep working. Clearing filters resets every control.
- **S3 — Discounts.** The admin can set an optional "precio anterior" greater than the current price. The storefront shows the current price as the selling price, the previous price crossed out, and a promo badge with the discount percentage. Cart totals and orders keep using the current price.
- **S4 — Card badges.** Product cards show clear, non-overlapping badges for discounts/promotions, sold out, and made-to-order. The existing add-to-cart and variant behavior is preserved.
- **S5 — Quality.** Pure helpers for pricing and catalog filtering have unit tests. TypeScript typecheck and the Next build pass. The database migration is applied locally and the storefront renders the new controls and badges.

## Tasks

| ID | Specs | Route | Status | Evidence |
| --- | --- | --- | --- | --- |
| T1 | S1, S3 | inline | done | `web/drizzle/0003_simple_edwin_jarvis.sql`, `schema.ts`, `types.ts`, `queries.ts` |
| T2 | S1, S3 | inline | done | `product-form.tsx`, `actions.ts`, `admin-products-view.tsx` |
| T3 | S2, S3, S5 | inline | done | `pricing.ts`, `catalog.ts` + 12 unit tests |
| T4 | S2 | inline | done | `catalog.tsx` price range, sorting, reset |
| T5 | S1, S3, S4 | inline | done | `ProductCard.tsx`, `ProductDetail.tsx`, `Icons.tsx` |
| T6 | S1 | inline | done | `stock.ts`, `orders-server.ts` |
| T7 | S5 | inline | done | 12 test files / 62 tests, typecheck, build, smoke |
| T8 | S5 | inline | done | verification log below |

- **T1 — Data model.** Add `madeToOrder` and `compareAtPriceCents` columns, map them into `Product`, and generate/apply the migration.
- **T2 — Admin.** Add the made-to-order checkbox and previous-price field to the product form; validate and persist them; surface them in the admin list.
- **T3 — Pure helpers.** Add discount percentage and catalog filter/sort helpers with unit tests.
- **T4 — Catalog UI.** Add minimum/maximum price inputs, sort selector, active-filter reset, and use the pure helper.
- **T5 — Presentation.** Add discount, made-to-order, and sold-out badges plus crossed-out prices on cards and detail.
- **T6 — Ordering.** Treat made-to-order products as unlimited stock and skip stock checks/decrements when creating orders.
- **T7 — Verify.** Run tests, typecheck, build, apply the migration, and smoke-test the rendered storefront.
- **T8 — Close.** Record verification evidence and final state.

## Log

- **L1 (user, verbatim):** "ok listo, mira quiero que tengamos tambien un propiedad de los productos que sea que son por encargo  y me gustaria que tuviera filtros ya sea por rango de precios ordenar por fecha de insercion o precios, que pudiera poner un descuento y que salga como promocion o descuento o agotado y cosas asi llamativas en las tarjetas"
- **L2 (decision):** The live app is `web/` (Next.js + PostgreSQL + Drizzle). The legacy Vite app in the repository root is left untouched.
- **L3 (decision):** Discounts use an optional `precio anterior` (compare-at price). The current price remains the single selling price, so cart, checkout, WhatsApp, and order persistence keep working without recalculating totals. The promo badge derives the percentage from the two prices.
- **L4 (decision):** Made-to-order products bypass stock tracking: they never show "Agotado" and orders do not check or decrement stock for them.
- **L5 (assumption):** The "Nuevo" badge is not included; the requested attractive badges are discount/promo, sold out, and made-to-order. Insertion date is used for sorting.
- **L6 (implementation):** Added `made_to_order` and `compare_at_price_cents` to `products`, mapped them as `porEncargo`, `precioAnterior`, and `creadoEn` in `Product`, and generated/applied `0003_simple_edwin_jarvis.sql`. The admin form edits both fields; the action validates that the previous price is higher than the current price. Made-to-order products bypass stock checks and decrements in the storefront and order creation.
- **L7 (implementation):** Catalog filtering and sorting live in `web/src/lib/catalog.ts` and are covered by unit tests. The card and detail show promo percentage, crossed-out previous price, sold-out, and made-to-order badges. The detail also explains that made-to-order pieces are coordinated by WhatsApp.
- **L8 (verification):** `npm test` → 12 files, 62 tests passing. `npm run typecheck` → clean. `npm run build` → green. The migration applied to the local `angeles_store` database. The rendered storefront contains the price inputs, sort selector, reset control, promo badge, crossed-out price, and made-to-order badge. The admin product form rendered both new fields, and submitting it persisted `made_to_order = true` and `compare_at_price_cents = 59000` for `c1` (then reverted the flag to false).
- **L9 (local data note):** For a visual demo, the local catalog has `c1` with a previous price of 590.00 and `s3` marked as made-to-order. Both can be reverted from the admin if the store should not show those examples.
- **L10 (known baseline):** `npm run lint` reports pre-existing errors in generated `.next` files and existing `setState`-in-effect patterns; the changed source files introduce no new lint errors beyond the existing `<img>` warnings.
