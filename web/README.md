# Angeles Store's — Next.js store and admin

Database-backed storefront and admin panel for Angeles Store's. This app replaces the
localStorage admin with PostgreSQL, server-side sessions, admin roles, and Cloudflare R2
image uploads. The original Vite app remains at the repository root until the cutover.

## Requirements

- Node.js 20 or newer
- PostgreSQL 16
- A Cloudflare R2 bucket (optional for local work; the URL field still works without it)

## Local development

```bash
cd web
npm install
cp .env.example .env
# Edit .env: DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD and R2_*.
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000 and http://localhost:3000/admin/login.

`db:seed` inserts the catalog, the default settings, and the admin user only when they do
not exist yet. Re-running it is safe.

The production bootstrap is different: `node seed.mjs` creates the settings and the admin but
**leaves the product catalog empty** unless `SEED_PRODUCTS=true` is set.

If you forget the admin password:

```bash
npm run db:admin
```

## Admin roles and routes

There are two roles:

| Role | Access |
| --- | --- |
| `owner` | Dashboard, products, orders, store settings, and user management. |
| `staff` | Dashboard, products, and orders only. |

The admin is split into these routes:

| Route | Page | Role |
| --- | --- | --- |
| `/admin` | Dashboard with summary cards, quick links, and recent orders. | Both |
| `/admin/productos` | Product list, search, and create/edit flow. | Both |
| `/admin/pedidos` | Orders and order detail. | Both |
| `/admin/tienda` | Store settings. `/admin/ajustes` redirects here. | Owner |
| `/admin/usuarios` | Team management: create users, change roles, reset passwords, delete. | Owner |

Role checks run on the server in the page and in every server action, so hiding a tab is
not the protection. Existing admin rows are promoted to `owner` by the migration; new users
created from `/admin/usuarios` default to `staff`. The last owner cannot be demoted or
deleted, and an owner cannot delete their own account.

`ADMIN_ROLE` controls the role used by `npm run db:admin` when it creates a new user. It
accepts `owner` or `staff` and defaults to `staff`; when the email already exists, only the
password changes.

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. |
| `ADMIN_EMAIL` | Admin login email used by the seed. |
| `ADMIN_PASSWORD` | Admin password used by the seed. Production requires 12+ characters. |
| `ADMIN_ROLE` | Role for a newly created user in `npm run db:admin`: `owner` or `staff` (default `staff`). |
| `SITE_URL` | Public site URL used for canonical and Open Graph metadata. Use `https://angelesstore.styledflow.com`. |
| `STORE_WHATSAPP` | Optional seed override for the business WhatsApp. 8 local digits or 11 including 504. |
| `SEED_PRODUCTS` | `false` (default) leaves the production store empty. Set `true` to load the demo catalog. |
| `R2_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |
| `R2_BUCKET` | Bucket name, for example `angeles-store`. |
| `R2_PUBLIC_URL` | Public base URL for uploaded objects. |
| `R2_ACCESS_KEY_ID` | R2 API token access key. |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret. |

Never commit `.env`. On Dokploy, set the same variables in the application environment.

## Cloudflare R2

1. In Cloudflare, open **R2 → Manage R2 API Tokens → Create API token**.
2. Give it **Object Read & Write** and scope it to the `angeles-store` bucket.
3. Put the access key and secret in `.env` or in Dokploy. Do not paste them in chat.
4. Use the `r2.dev` URL while the custom domain is being issued. A custom domain such as
   `angelesfile.styledflow.com` is better for production, but **Cloudflare Access must be
   disabled for that hostname** or the images will not be public.

Uploads happen on the server through `POST /api/admin/upload`, so the browser never receives
the R2 secret. The bucket CORS policy is only needed for direct browser uploads or for reading
objects from JavaScript; `<img>` tags do not require it. If direct uploads are added later,
allow `PUT`/`POST`, the application origin, and expose `ETag`.

## Dokploy

### Nixpacks

1. Create a **PostgreSQL** service in Dokploy. Do not publish its port publicly.
2. Create an application from this repository with base directory `web/` and build type
   **Nixpacks**.
3. `web/nixpacks.toml` pins Node 22, installs dependencies, builds the app, applies
   migrations on start, and serves it with `next start`.
4. Set the environment variables from the table above. Use the internal Postgres hostname in
   `DATABASE_URL` and the public domain in `SITE_URL`.
5. Expose container port `3000` and use `/api/health` as the health check.
6. On the first deploy, run `node scripts/seed.mjs` once in the Dokploy container terminal.
   The catalog starts empty unless `SEED_PRODUCTS=true`.
7. To change the admin password later, update `ADMIN_PASSWORD` and run
   `node scripts/set-admin-password.mjs` once in the container.
8. Configure PostgreSQL backups in Dokploy to an S3-compatible destination (R2 works).

### Docker

The `web/Dockerfile` remains available. It builds Next with `output: "standalone"` and runs
the generated server after applying migrations. Use base directory `web/` and Dockerfile
build if you prefer Docker over Nixpacks.

## Sharing and SEO

Product pages expose Open Graph and Twitter metadata plus `Product` JSON-LD: name, price,
category, description, image, store name, and canonical URL. WhatsApp reads the Open Graph
tags when it builds a link preview.

- `SITE_URL` must be the public HTTPS domain in production, otherwise the preview URL points
  to localhost.
- WhatsApp cannot preview a `localhost` page. Deploy first and share the public URL.
- The product image must be publicly reachable. `r2.dev` works; a custom domain behind
  Cloudflare Access will not.
- WhatsApp caches previews. If a URL was shared before the metadata existed, append a query
  string such as `?v=2` to force a fresh preview.
- Portrait photos are cropped by WhatsApp. A square or landscape image previews better.

## Security notes

- Admin login uses bcrypt hashes, database-backed sessions, `httpOnly` cookies, and a login
  rate limit. The session cookie is `secure` in production.
- Every admin server action calls `requireAdmin()` or `requireOwner()`, so hiding the UI is
  not the protection. Store settings and user management are owner-only at both layers.
- The PostgreSQL port stays on the internal Docker network. Use an SSH tunnel or Tailscale if
  a remote connection is ever needed.
- Protect the Dokploy panel with a strong password, 2FA, and firewall rules.
- R2 secrets stay on the server. The browser only gets the public object URL.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next dev server on port 3000. |
| `npm run build` | Production build (standalone output). |
| `npm start` | Local production server. |
| `npm test` | Vitest logic tests. |
| `npm run typecheck` | TypeScript check. |
| `npm run db:generate` | Generate Drizzle migrations. |
| `npm run db:migrate` | Apply migrations with Drizzle Kit. |
| `npm run db:seed` | Seed catalog, settings, and admin from `.env`. |
| `npm run db:admin` | Create or update the admin password. |
| `npm run db:studio` | Drizzle Studio. |
