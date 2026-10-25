# Amapola — women's fashion store with WhatsApp checkout

Objective: Zero-backend React SPA for a women's fashion and accessories store, based on `prd_tienda_online_frontend_whatsapp.md`, with catalog, cart, WhatsApp order handoff, and a local admin panel.

Branch: `main` (new repository)
Delivery strategy: `single-pr` (greenfield, no PR slicing needed)
Test runner: `vitest`

## Specs

- **S1 — Women's fashion domain.** The store must sell women's fashion and accessories, not generic goods. Categories, seed catalog, copy, imagery, and visual identity must read as a women's boutique. Brand name is centralized in one config module so it can be renamed without touching components.
- **S2 — Catalog.** Map and render products from local data. Real-time text search over title and description. Category filters derived from active products. Product card shows image, formatted price, title, description, and category. (PRD RF1.1–RF1.4)
- **S3 — Cart.** Add and remove items. Increment and decrement quantity. Live order total. Cart persists in `localStorage`. (PRD RF2.1–RF2.3)
- **S4 — Checkout form.** Capture full name (required), delivery address (required), contact phone, preferred payment method (cash on delivery, bank transfer, card, cash), and notes. Validate required fields before allowing order submission. (PRD RF2.4)
- **S5 — WhatsApp handoff.** Build a formatted message with a consistent, widely supported emoji set and WhatsApp markdown, URI-encode it, and open `https://wa.me/{phone}?text={message}` in a new tab. (PRD RF3.1–RF3.3)
- **S6 — Admin panel.** Create, search, filter, edit, and delete products with confirmation. Support image via external URL or local Base64 conversion. Edit the business phone number. Export the catalog as JSON and import a previous JSON file to replace the catalog. (PRD RF4.1–RF4.5)
- **S7 — Data and persistence.** Product schema matches PRD section 5 (`id`, `nombre`, `precio`, `categoria`, `descripcion`, `imagen`). Products and business settings persist in `localStorage`; seed data loads on first run. (PRD section 5)
- **S8 — Delivery quality.** Responsive layout, accessible controls, no backend calls, production build passes, and pure logic has unit tests.
- **S9 — Honduras regionalization.** Locale `es-HN`, currency HNL formatted as `L 1,290`, Honduran WhatsApp numbers normalized to `+504` plus 8 digits, Honduran address placeholders, vocabulary (`aretes`, `bolsos`, `falda`, `clóset`), and lempira-scale prices.
- **S10 — Friendly tone.** Store copy uses neutral Honduran tuteo (never voseo), warm microcopy, a trust strip, actionable empty states, and clear success feedback.
- **S11 — Admin practicality.** Tabs for products and settings, catalog search and category filter, actionable stats (including products without a photo), side-drawer editor with category chips and image preview, delete confirmation, and feedback visible inside the panel.
- **S12 — Emoji rendering.** WhatsApp uses a small, consistent emoji set with clean spacing; the document declares `es-HN` and the UI declares an explicit color-emoji font fallback.

## Tasks

| ID | Specs | Route | Status | Evidence |
| --- | --- | --- | --- | --- |
| T1 | S1, S8 | inline | done | `62f2572` · `npm run build` passes |
| T2 | S1, S7 | inline | done | `966911e` · 12 women's fashion products |
| T3 | S3, S5, S7 | inline | done | `9ef4157` · 10 unit tests pass |
| T4 | S2, S8 | inline | done | `966911e` · search, filters, image fallback |
| T5 | S3 | inline | done | `966911e` · cart drawer, persistence |
| T6 | S4, S5 | inline | done | `966911e` · validated form, `wa.me` handoff |
| T7 | S6, S7 | inline | done | `966911e` · CRUD, JSON import/export, Base64 |
| T8 | S1, S8 | inline | done | `966911e` · smoke test + build green |
| T9 | S9, S12 | inline | done | `18a4d3b` · HNL, +504 phone lib, emoji set |
| T10 | S10 | inline | done | `1ad4064` · Honduran tuteo across storefront |
| T11 | S6, S11 | inline | done | `46ca84c` · tabs, search, drawer, confirm |
| T12 | S10, S11 | inline | done | `1ad4064`, `46ca84c` · toast, summary, feedback |

- **T1 — Scaffold.** Initialize git, Vite + React + TypeScript + Tailwind, base config files.
- **T2 — Domain data.** Central brand/config module, types, and a women's fashion seed catalog.
- **T3 — Pure logic.** Currency formatting, storage helpers, WhatsApp message builder, and unit tests.
- **T4 — Storefront.** Header, hero, search, category filters, product grid, product card, image fallback.
- **T5 — Cart.** Cart drawer with quantity controls, subtotal, and persistence.
- **T6 — Checkout.** Customer form, validation, WhatsApp launch.
- **T7 — Admin.** Product CRUD, phone settings, JSON import/export, Base64 image upload.
- **T8 — Polish.** Responsive pass, visual identity, production build, final verification.
- **T9 — Regionalize.** HNL currency and `es-HN` locale, lempira prices, Honduran phone normalization with tests, Honduran vocabulary, consistent WhatsApp emoji set.
- **T10 — Rewrite copy.** Move storefront and checkout copy from voseo to neutral Honduran tuteo, warm empty states, trust strip, announcement bar.
- **T11 — Redesign admin.** Tabs, stats, search/filter, side-drawer editor, category chips, delete confirmation, phone validation, feedback inside the panel.
- **T12 — Friendlier flow.** Add-to-cart toast with "Ver carrito" action, product button feedback, order summary in checkout, Escape/scroll-lock behavior.

## Log

- **L1 (user, verbatim):** "ok comencemos, pero veamos que el sistema es para venta de cosas de mujer adaptala para que sea asi"
- **L2 (decision):** Interpreted "cosas de mujer" as women's fashion and accessories (clothing, footwear, bags, jewelry, beauty). Brand name "Amapola" is provisional and lives in `src/config.ts`.
- **L3 (decision):** Currency defaults to ARS with `es-AR` formatting, configurable in `src/config.ts`.
- **L4 (decision):** Business phone defaults to a placeholder and is editable from the admin panel.
- **L5 (user, verbatim):** "mira los emogies no se ven bien, la parte admin no la veo practica y regionliza a honduras, y hazla mas amigable"
- **L6 (decision):** The store is now regionalized to Honduras: `es-HN` locale, HNL currency (`L 1,290`), lempira-scale prices, `+504` phone normalization, Honduran address placeholders, and local vocabulary (`aretes`, `bolsos`, `falda`, `clóset`).
- **L7 (decision):** Store copy moved from Rioplatense voseo to neutral Honduran tuteo. Emojis were reduced to a small, consistent WhatsApp set; the UI keeps SVG icons and declares a color-emoji font fallback.
- **L8 (decision):** The admin panel was rebuilt around daily use: tabs, search/filter, stats, side-drawer editor, delete confirmation, and feedback rendered in both store and admin views.
- **L9 (decision):** `localStorage` data version 2 migrates browsers that ran the previous catalog: refreshes seed products, preserves products created by the owner, and replaces the old Argentine placeholder phone without overwriting a real configured number.
- **L10 (verification):** `npm test` → 5 files, 24 tests passing. `npm run build` → TypeScript + Vite build green. All Vite modules return HTTP 200. WhatsApp message verified with correct emoji codepoints and `L 2,580` total.
