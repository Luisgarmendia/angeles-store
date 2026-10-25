# Angeles Store's — creams, shirts and women's fashion with WhatsApp checkout

Objective: Zero-backend React SPA for a women's store focused on creams and shirts, with a general women's catalog, product detail pages with recommendations, cart, WhatsApp order handoff, and a local admin panel.

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
- **S12 — Message rendering.** The WhatsApp order message uses WhatsApp markdown plus a small emoji set from Unicode 6.0 (2010) or older, avoiding newer characters that render as empty boxes on some devices.
- **S13 — Brand and catalog focus.** The store is named exactly `Angeles Store's` and sells mostly creams and shirts plus general women's products. Brand strings live in `src/config.ts`; the seed catalog is 18 products across Cremas, Camisas, Vestidos, Pantalones, Calzado, Bolsos, and Accesorios.
- **S14 — Product detail.** Every product opens a hash-addressable detail section at `#producto/{id}` with image, name, category, price, description, quantity selector, add-to-cart, and a back link to the catalog. Below the detail, up to 4 recommended products appear, same category first, never the product being viewed.
- **S15 — Catalog migration.** `DATA_VERSION` 3 replaces the legacy `p1`–`p12` seed, preserves products created by the owner, and prunes cart lines whose product no longer exists.
- **S16 — Contact and social settings.** Admin → Ajustes edits the order WhatsApp plus Instagram, Facebook, and TikTok. Each network accepts a full URL, a bare handle, or an `@handle`; the footer shows only the networks that are configured.
- **S17 — Decimal prices.** Every price in the storefront, cart, checkout, WhatsApp message, and admin panel shows two decimals (`L 1,290.00`). The admin accepts cents and never rounds a price to a whole lempira.
- **S18 — Returning customer.** A successful checkout saves name, address, phone, payment method, and notes in `localStorage`; the next checkout prefills that data. Nothing is sent anywhere.
- **S19 — Styled selectors.** The checkout payment method and the admin category filter use a shared styled select with a custom chevron, focus ring, and consistent spacing.
- **S20 — Admin access gate.** Opening the admin panel requires a 4–8 digit PIN created by the owner on first use. The PIN is stored as a salted hash in `localStorage`, unlocks the panel for the tab session, can be changed from Ajustes with the current PIN, and can be locked manually. This is local deterrence for a zero-backend app, not server-side authorization.
- **S21 — Shipping cost notice.** The cart drawer, checkout, product detail, and WhatsApp order message state that shipping may carry an extra cost and is coordinated by WhatsApp.
- **S22 — Safe emoji set.** Every emoji in the order message belongs to an allowlist of long-supported characters, enforced by a test.

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
| T13 | S13 | inline | done | `2ce85cd` · 18 products, 18/18 images 200 |
| T14 | S14 | inline | done | `b3a3e13` · hash route, detail, recommendations, quantity |
| T15 | S13, S15 | inline | done | `321e5aa` · migration v3, 36 tests |
| T16 | S16 | inline | done | `ae825c0` · social settings + footer links |
| T17 | S17 | inline | done | `ae825c0` · two decimals end to end |
| T18 | S18 | inline | done | `ae825c0` · customer persistence |
| T19 | S19 | inline | done | `ae825c0` · shared styled select |
| T20 | S20 | inline | done | `549fdb8` · PIN gate, lock and key change, 3 tests |
| T21 | S21 | inline | done | `1dafb48` · shipping notice in cart, checkout and message |
| T22 | S12, S22 | inline | done | `1dafb48`, `715c0e0` · allowlisted emoji + test |

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
- **T13 — Rebrand and recatalog.** Rename the store to Angeles Store's, rebuild the seed catalog around creams and shirts, and resize the brand on header, footer, hero, and document metadata.
- **T14 — Detail and recommendations.** Hash-addressable product detail with quantity selector, add-to-cart, back navigation, and same-category-first recommendations below.
- **T15 — Catalog migration.** Bump the stored data version, drop the legacy seed, keep owner-created products, and prune stale cart lines.
- **T16 — Contact settings.** Edit WhatsApp, Instagram, Facebook, and TikTok from Admin → Ajustes; render configured networks in the footer.
- **T17 — Decimal prices.** Format every price with two decimals and stop rounding cents when saving a product.
- **T18 — Saved customer.** Persist checkout data locally on a successful order and prefill it on the next visit.
- **T19 — Styled selectors.** Replace the raw payment and category selects with one shared component that matches the store's visual language.
- **T20 — Protect admin.** PIN setup and unlock screen, session unlock, manual lock, and key change from Ajustes.
- **T21 — Shipping notice.** State in the cart, checkout, detail, and WhatsApp message that shipping may cost extra.
- **T22 — Safe emoji message.** Keep the message personality with a conservative emoji allowlist and pin it with a test.

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
- **L11 (user, verbatim):** "se va a llmar Angeles Store's y la venta es mas que todo cremas y camisas y de todo para mujer, y a demas quiero que tenga una seccion para ver el detalle de los productos, y que abajo salgan productos recomendados,"
- **L12 (decision):** Brand is exactly `Angeles Store's` (apostrophe, no accent) and stays centralized in `src/config.ts`. The seed catalog is 18 products: 6 Cremas (`c1`–`c6`), 5 Camisas (`s1`–`s5`), 2 Vestidos (`v1`, `v2`), 2 Pantalones (`pa1`, `pa2`), 1 Calzado (`z1`), 1 Bolsos (`b1`), 1 Accesorios (`a1`).
- **L13 (decision):** Detail pages are hash-addressable at `#producto/{id}` so browser back works and a product can be linked directly. Recommendations put the same category first, exclude the viewed product, and cap at 4. `addToCart` accepts an optional quantity for the detail selector.
- **L14 (decision):** `DATA_VERSION` 3 treats `p1`–`p12` as replaced seed, preserves owner-created products, and prunes cart lines for products that no longer exist.
- **L15 (verification):** `npm test` → 7 files, 36 tests passing. `npm run build` → green. All 18 catalog images return HTTP 200 and every new Vite module returns 200. Work units were committed on `main` because the repository has no remote and its history lives there.
- **L16 (user, verbatim):** "ok mira, hay muchas cosas que mejorar y quiero que las hagamos rapido, en la seccion de ajustes poner las redes sociales, mostrar los precions con los decimales, y si un cliente ya guardo su nombre o infromacion que se guarde en el local stoage y se rellene solo, tamboen los combobox o selector no tienen disenio no se ve bien"
- **L17 (decision):** `StoreSettings` now carries `instagram`, `facebook`, and `tiktok`. The admin accepts a full URL, a bare handle, or an `@handle` and `socialHref` builds the link at render time; empty networks stay hidden. Prices use two decimals everywhere and the admin stores cents instead of rounding. Checkout data is saved under `amapola.cliente` only after a successful order and reloaded when the form opens. The raw `<select>` elements were replaced by one shared `Select` component.
- **L18 (verification):** `npm test` → 8 files, 45 tests passing. `npm run build` → green. Vite serves the new `Select` component and the updated modules with HTTP 200.
- **L19 (user, verbatim):** "perfecto ahora mira tenemos que buscar una forma de asegurar el panel de admin, y otra cosa que hay que agregar el proceso del carrito que diga nada mas que el envio puede llevar un costo extra, y mira los emogies no funcionan salen cuadros que no existen"
- **L20 (decision):** The admin panel is gated by a 4–8 digit PIN created on first use. Only a salted hash is stored in `localStorage`; the unlock lives in `sessionStorage` for the tab session, and Ajustes can change the key with the current one. This deters casual access on the same device but is not server-side security, because the app has no backend. There is no PIN recovery: clearing browser storage is the only reset.
- **L21 (decision):** Shipping copy is centralized in `config.shipping.note`: the cart, checkout, detail, and WhatsApp message state that shipping may cost extra and is coordinated by WhatsApp. The message labels the amount as `TOTAL PRODUCTOS`.
- **L22 (decision):** Emojis were removed from the WhatsApp message because some devices rendered them as empty boxes; the message now uses plain text and WhatsApp markdown only. A test rejects emoji ranges so they do not return.
- **L23 (verification):** `npm test` → 9 files, 51 tests passing. `npm run build` → green. No emoji characters remain in `src` or `index.html`.
- **L24 (user, verbatim):** "Abrir apli pero los emogies le dan personalidad los necesito"
- **L25 (decision):** Emojis return to the WhatsApp message, but only from Unicode 6.0 (2010) or older: 📦 👤 📱 📍 💳 📝 📋 💰 🚚 🌷. Newer characters such as 🛍️ (2014) and 🧾 (2018) were the likely cause of the empty boxes and stay out. A test asserts every emoji in the message belongs to `ORDER_EMOJI`.
- **L26 (verification):** `npm test` → 9 files, 51 tests passing. `npm run build` → green.
