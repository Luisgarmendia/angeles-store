# Amapola — women's fashion store with WhatsApp checkout

Objective: Zero-backend React SPA for a women's fashion and accessories store, based on `prd_tienda_online_frontend_whatsapp.md`, with catalog, cart, WhatsApp order handoff, and a local admin panel.

Branch: `main` (new repository)
Delivery strategy: `single-pr` (greenfield, no PR slicing needed)
Test runner: `vitest`

## Specs

- **S1 — Women's fashion domain.** The store must sell women's fashion and accessories, not generic goods. Categories, seed catalog, copy, imagery, and visual identity must read as a women's boutique. Brand name is centralized in one config module so it can be renamed without touching components.
- **S2 — Catalog.** Map and render products from local data. Real-time text search over title and description. Category filters derived from active products. Product card shows image, formatted price, title, description, and category. (PRD RF1.1–RF1.4)
- **S3 — Cart.** Add and remove items. Increment and decrement quantity. Live order total. Cart persists in `localStorage`. (PRD RF2.1–RF2.3)
- **S4 — Checkout form.** Capture full name (required), delivery address (required), contact phone, preferred payment method (cash, transfer, card), and notes. Validate required fields before allowing order submission. (PRD RF2.4)
- **S5 — WhatsApp handoff.** Build a formatted message with emojis and WhatsApp markdown, URI-encode it, and open `https://wa.me/{phone}?text={message}` in a new tab. (PRD RF3.1–RF3.3)
- **S6 — Admin panel.** Create and edit products. Support image via external URL or local Base64 conversion. Edit the business phone number. Export catalog as `productos.json`. Import a previous JSON file to replace the catalog. (PRD RF4.1–RF4.5)
- **S7 — Data and persistence.** Product schema matches PRD section 5 (`id`, `nombre`, `precio`, `categoria`, `descripcion`, `imagen`). Products and business settings persist in `localStorage`; seed data loads on first run. (PRD section 5)
- **S8 — Delivery quality.** Responsive layout, accessible controls, no backend calls, production build passes, and pure logic has unit tests.

## Tasks

| ID | Specs | Route | Status | Evidence |
| --- | --- | --- | --- | --- |
| T1 | S1, S8 | inline | done | `npm run build` passes |
| T2 | S1, S7 | inline | done | 12 women's fashion products, brand config centralized |
| T3 | S3, S5, S7 | inline | done | 10 unit tests pass |
| T4 | S2, S8 | inline | done | catalog with search, filters, image fallback |
| T5 | S3 | inline | done | cart drawer with quantity controls and persistence |
| T6 | S4, S5 | inline | done | validated form, `wa.me` handoff |
| T7 | S6, S7 | inline | done | CRUD, phone, JSON import/export, Base64 upload |
| T8 | S1, S8 | inline | done | responsive pass, dev server smoke test, build green |

- **T1 — Scaffold.** Initialize git, Vite + React + TypeScript + Tailwind, base config files.
- **T2 — Domain data.** Central brand/config module, types, and a women's fashion seed catalog.
- **T3 — Pure logic.** Currency formatting, storage helpers, WhatsApp message builder, and unit tests.
- **T4 — Storefront.** Header, hero, search, category filters, product grid, product card, image fallback.
- **T5 — Cart.** Cart drawer with quantity controls, subtotal, and persistence.
- **T6 — Checkout.** Customer form, validation, WhatsApp launch.
- **T7 — Admin.** Product CRUD, phone settings, JSON import/export, Base64 image upload.
- **T8 — Polish.** Responsive pass, visual identity, production build, final verification.

## Log

- **L1 (user, verbatim):** "ok comencemos, pero veamos que el sistema es para venta de cosas de mujer adaptala para que sea asi"
- **L2 (decision):** Interpreted "cosas de mujer" as women's fashion and accessories (clothing, footwear, bags, jewelry, beauty). Brand name "Amapola" is provisional and lives in `src/config.ts`.
- **L3 (decision):** Currency defaults to ARS with `es-AR` formatting, configurable in `src/config.ts`.
- **L4 (decision):** Business phone defaults to a placeholder and is editable from the admin panel.
