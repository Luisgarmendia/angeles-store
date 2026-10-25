# Angeles Store's — Next.js + Postgres migration

Objective: replace the localStorage admin with a Next.js app backed by PostgreSQL, real server-side auth, and a Dokploy deployment. The current Vite SPA stays working until the cutover.

Branch: `main`
Delivery strategy: `single-pr`
Test runner: `vitest`

## Specs

- **S1 — Next.js app.** A new `web/` app with the App Router, Tailwind, and the existing visual language. The Vite app remains untouched until parity.
- **S2 — PostgreSQL data layer.** Drizzle schema and migrations for products, settings, admin users, and admin sessions. Seed from the current catalog and defaults.
- **S3 — Real admin auth.** Email/password login with bcrypt hashes, database-backed sessions, `httpOnly` cookies, protected admin layout, protected server actions, logout, and login rate limiting. No client-side PIN as the security boundary.
- **S4 — Public store.** Server-rendered catalog and `/producto/[id]` pages with metadata, search/filter, recommendations, cart in `localStorage`, and the WhatsApp checkout handoff.
- **S5 — Admin panel.** Server-action CRUD for products, visibility toggle, and settings for hero, contact/social, and enabled payment methods.
- **S6 — Local and Dokploy.** Local PostgreSQL for development; Docker standalone build for Dokploy with migrations, health check, environment variables, and no public database port.
- **S7 — Quality.** Pure logic unit tests, TypeScript build, and a local smoke test of the store and auth helpers.
- **S8 — R2 uploads.** Admin can upload product and hero images server-side to Cloudflare R2; the browser never receives the secret. The URL field remains as a fallback. Order persistence is deferred.
- **S9 — Production bootstrap.** The Docker standalone image runs migrations on start, includes one-time seed and password-reset scripts, and reads every secret from environment variables. Dokploy keeps PostgreSQL on the internal network with backups.
- **S10 — Admin catalog views.** The admin product list can be shown as cards or as a compact list. The choice is remembered in the browser.
- **S11 — Store information.** Admin → Ajustes edits the store name, address, and description. Those values feed the header, footer, page metadata, admin chrome, and the WhatsApp order message; older settings rows fill the new fields from defaults.

## Tasks

| ID | Specs | Route | Status | Evidence |
| --- | --- | --- | --- | --- |
| T1 | S1 | inline | done | `2879da5` · Next scaffold in `web/` |
| T2 | S2 | inline | done | `2879da5` · schema, migration, seed |
| T3 | S3 | inline | done | `2879da5` · auth helpers, login, protected layout |
| T4 | S4 | inline | done | `2879da5` · store pages, cart, WhatsApp |
| T5 | S5 | inline | done | `2879da5` · admin CRUD and settings |
| T6 | S6 | inline | done | `2879da5` · Dockerfile, health check, env |
| T7 | S7 | inline | done | `2879da5` · tests, build, smoke |
| T8 | S8 | inline | done | `2879da5` · R2 upload verified with `r2.dev` |
| T9 | S6, S9 | inline | done | `2879da5` · migrate/seed/password scripts |
| T10 | S10 | inline | done | `0ffbdc2` · cards/list toggle + persisted view |
| T11 | S11 | inline | done | `7417568` · store name, address and description in settings |

- **T1 — Scaffold.** Create the Next app in `web/` and reuse Tailwind, fonts, and component patterns.
- **T2 — Database.** Add Drizzle, schema, migration, seed, and queries.
- **T3 — Auth.** Bcrypt password, session table, cookie helpers, login/logout, route protection.
- **T4 — Storefront.** Store layout, catalog, product detail, cart provider, checkout.
- **T5 — Admin.** Product CRUD, settings form, server actions.
- **T6 — Deploy.** Standalone Dockerfile, migration runner, health check, Dokploy notes.
- **T7 — Verify.** Port logic tests, run build, smoke test the app.
- **T8 — R2 uploads.** Server-side S3 upload for product and hero images, admin-only route, public URL returned to the form.
- **T9 — Production bootstrap.** Standalone Dockerfile, migration on start, one-time seed, password reset, Dokploy documentation.
- **T10 — Admin catalog views.** Toggle between product cards and a compact list, with the preference stored in the browser.
- **T11 — Store information.** Editable store name, address, and description, with a settings merge for older rows and a shared settings context in the storefront.

## Log

- **L1 (user, verbatim):** "dale hazlo que funcione"
- **L2 (decision):** Next.js App Router + PostgreSQL + Drizzle in `web/`. Auth is a small database-backed email/password session implementation (bcrypt + `httpOnly` cookie) instead of Supabase, because the user deploys with Dokploy and wants the database on their own server. R2 is phase 2; images are URLs for now.
- **L3 (issue):** Docker is not installed on the development machine. PostgreSQL 16.15 was installed with Homebrew and runs locally on `127.0.0.1:5432` with database `angeles_store` and user `angeles` (development credentials only).
- **L4 (decision):** The production database is never published to the internet. On Dokploy the app connects over the internal network; remote development access, if ever needed, uses an SSH tunnel or Tailscale.
- **L5 (user):** Cloudflare R2 bucket `angeles-store` created. S3 endpoint `https://7127ad6b8bdc4f567a53aedd619d39da.r2.cloudflarestorage.com`, custom domain `angelesfile.styledflow.com` (Access enabled), development URL `https://pub-97911d773cce45d49b7707c09b130909.r2.dev`, and a CORS policy allowing `GET` from `http://localhost:3000`.
- **L6 (decision):** Uploads happen on the server through `POST /api/admin/upload` using `@aws-sdk/client-s3`, with the R2 access key and secret only in the environment. The public URL is `r2.dev` until the custom domain finishes initializing; Cloudflare Access must be disabled on that hostname for public images. The CORS policy is not needed for server-side uploads or `<img>` tags; it would only matter for direct browser uploads or JavaScript reads.
- **L7 (verification):** PostgreSQL 16.15 local. `npm test` → 6 files, 31 tests passing. `npm run build` → green with and without `.env`. Public `/` and `/producto/c1` return 200 and render the catalog and recommendations. Login with the seeded admin returns 303 to `/admin` with a session cookie; `/admin` without a cookie redirects to `/admin/login`. Creating a product from the admin shows it on the storefront, and deleting it removes it; settings changes update the hero and revert correctly. The upload route returns 401 without a session and 503 without R2 keys.
- **L8 (pending):** Add `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` to `web/.env` and Dokploy to enable real uploads. Docker is not installed on the development machine, so the image was not built locally; the Dockerfile and Dokploy steps are documented in `web/README.md`.
- **L9 (user, verbatim):** "ok me carga con el endpoint dev y funciona correctamente, y todo bien, ahora quiero que en la parte del admin se vean como tarjetas y como lista"
- **L10 (decision):** R2 uploads are verified with the `r2.dev` public URL; the custom domain can stay behind Access until it is ready. The admin catalog defaults to cards and offers a list view, with the selected view stored under `angeles.admin.products.view` in `localStorage`.
- **L11 (verification):** `npm test` → 6 files, 31 tests passing. `npm run build` → green. The server-rendered admin HTML contains both view buttons and the card grid; product create/delete and settings flows remain unchanged.
- **L12 (user, verbatim):** "ok en ajustes nos hace falta la infromacion de la tienda, ejemplo nombre direccion y una descriocion que eso no esta"
- **L13 (decision):** `StoreSettings` now carries `store: { name, address, description }`, edited in a new Ajustes card. The store layout provides the settings through a client context, so the header, footer, cart, product-image fallback, and WhatsApp message use the configured name. The admin layout and login page fetch the settings from PostgreSQL, and the store layout generates metadata from the name and description. `mergeSettings` fills the new fields for rows saved before this change.
- **L14 (verification):** `npm test` → 7 files, 34 tests passing. `npm run build` → green. Saving a test store name, address, and description updated the header and footer; reverting restored the production values. Home title is `<store name> — Cremas…` and a product title is `<product> · <store name>`.
