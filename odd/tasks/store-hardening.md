# Angeles Store's — Store hardening (trust, checkout, UX, admin, SEO)

Objective: close the highest-impact gaps in the live store without adding reviews yet: legal/trust pages, an honest checkout privacy message, phone validation, cart stock limits, order rate limiting, a mobile menu, offers/made-to-order filters, accessible modals, payment status, an admin summary, order search, image reordering, low-stock visibility, sitemap/robots, store JSON-LD, and admin noindex.

Branch: `feat/catalog-experience` (continues PR #1)
Delivery strategy: `single-pr`
Test runner: `vitest` (`cd web && npm test`)

## Specs

- **S1 — Trust and legal.** The checkout no longer claims that order data stays only on the device. The store has privacy, terms, shipping/returns, and FAQ pages linked from the footer. The sitemap includes them. The store emits `Organization` and `WebSite` JSON-LD. Admin pages are `noindex`.
- **S2 — Checkout integrity.** The checkout requires a valid Honduran phone, the server normalizes it, the cart cannot exceed available stock, and public order creation is rate-limited per client.
- **S3 — Storefront UX.** The header has a mobile menu. The catalog can filter only offers and only made-to-order products. Cart and checkout dialogs trap focus and restore it on close.
- **S4 — Admin operations.** Orders have a payment status. The admin landing page shows pending orders, pending payments, low stock, and total sales. Orders can be searched by number, customer, phone, or address. Product gallery photos can be reordered. Low-stock products are flagged.
- **S5 — Quality.** Unit tests cover the new cart, pricing, catalog, phone, and rate-limit behavior. TypeScript, the Next build, migrations, and storefront/admin smoke tests pass.

## Tasks

| ID | Specs | Route | Status | Evidence |
| --- | --- | --- | --- | --- |
| T1 | S1 | inline | pending | legal pages, footer, checkout copy, sitemap/robots, JSON-LD, admin noindex |
| T2 | S2 | inline | pending | phone validation, cart cap, order rate limit |
| T3 | S3 | inline | pending | mobile menu, offers/made-to-order filters, focus trap |
| T4 | S4 | inline | pending | payment status, admin summary, order search, image reorder, low stock |
| T5 | S5 | inline | pending | tests, typecheck, build, migrations, smoke |

- **T1 — Trust and SEO.** Fix the checkout privacy copy; add `/privacidad`, `/terminos`, `/envios-y-devoluciones`, and `/preguntas-frecuentes`; link them in the footer; add `sitemap.xml`, `robots.txt`, store JSON-LD, and admin `noindex`.
- **T2 — Checkout integrity.** Require and normalize a Honduran phone in the checkout and server action; clamp cart quantities to available stock; add an in-memory per-client order rate limit.
- **T3 — Storefront UX.** Add a mobile menu to the header; add "Solo ofertas" and "Solo por encargo" filters; trap and restore focus in the cart and checkout dialogs.
- **T4 — Admin operations.** Add `payment_status` to orders with an admin update action; add a summary strip to `/admin`; add order search; add gallery reordering and low-stock badges.
- **T5 — Verify.** Run tests, typecheck, build, generate/apply the migration, and smoke-test the storefront and admin.

## Log

- **L1 (user, verbatim):** "ok mejora todo lo necesario haz tareas concretas y haz agantes especializados para cada uno, lo de las resenias eso para despues,"
- **L2 (decision):** Reviews are explicitly out of scope for this batch. Analytics, coupons, online payments, customer order lookup, and `next/image` are also deferred because they need a provider or a larger product decision.
- **L3 (runtime note):** The `subagent` tool is denied in this runtime (`Permission denied: subagent`), so the tasks are executed inline in the same order a specialized worker would receive them. No delegation is claimed.
- **L4 (decision):** Legal pages use the live store settings for the name, address, and WhatsApp, and describe the actual flow (WhatsApp confirmation, database-backed orders, localStorage prefill). The owner should review the final legal copy.
- **L5 (decision):** Payment status is an additive enum (`pendiente`, `pagado`, `reembolsado`) on `orders`; existing rows default to `pendiente`.
- **L6 (decision):** The order rate limit is in-memory and per instance (10 successful orders per hour per forwarded IP). It is a mitigation, not a distributed guarantee; a shared store can be added later if needed.
