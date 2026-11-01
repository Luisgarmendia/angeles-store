# Angeles Store's

Storefront and admin workspace for a Honduras-based women's clothing and skincare
shop. Customers browse the catalog, build a cart, and check out by sending the
order through WhatsApp; staff manage products, variants, orders, store settings,
and users from an admin panel backed by Postgres.

The application lives in [`web/`](web). The repository root holds only
infrastructure: CI, ignore rules, and planning notes.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL 16 with Drizzle ORM |
| Images | Cloudflare R2 |
| Push | Firebase Cloud Messaging |
| Tests | Vitest |

## Requirements

- **Node 24.** The lockfiles were generated with npm 11 (the version Node 24
  ships) and npm 10 rejects their metadata. Several Firebase packages also
  require `>= 24.12.0`.
- PostgreSQL 16 reachable from `DATABASE_URL`.

## Setup

```bash
cd web
npm ci
cp .env.example .env        # then fill DATABASE_URL, R2_*, SITE_URL
npm run db:migrate
npm run db:seed             # optional demo catalog
npm run db:admin            # create the first admin user
npm run dev
```

## Scripts

Run these from `web/`:

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | Vitest suite |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate a migration from `src/db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Drizzle Studio |
| `npm run db:seed` | Load the demo catalog |
| `npm run db:admin` | Create or update an admin user |

## CI

`.github/workflows/ci.yml` installs `web/` and runs typecheck plus the full test
suite on every push to `main` and every pull request. `next build` is
deliberately excluded: it needs database and storage credentials, so it would
fail on infrastructure rather than on code.

## Notes

- Every published page is expected to go through `web/src/lib/seo.ts`
  (`pageMetadata`) and to appear in `web/src/app/sitemap.ts`. Catalog entities
  emit JSON-LD. `web/src/lib/seo.test.ts` and `web/src/lib/site-url.test.ts`
  guard that contract.
- `SITE_URL` must be set in the deployed environment. Without it,
  `getSiteUrl()` falls back to `http://localhost:3000` and every canonical URL,
  sitemap entry, Open Graph tag, and JSON-LD `@id` points at localhost.
- The storefront no longer carries a browser-side admin PIN: the admin panel
  authenticates against the database with hashed session tokens.

## History

The repository previously held a standalone Vite + React prototype of this
store at the root, with data in `localStorage` and an admin panel unlocked by a
client-side PIN. It was retired once the Next.js application reached feature
parity; the prototype remains in the Git history. The product brief that started
it is kept as [`prd_tienda_online_frontend_whatsapp.md`](prd_tienda_online_frontend_whatsapp.md).
