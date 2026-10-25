# Angeles Store's — Next.js store and admin

Database-backed storefront and admin panel for Angeles Store's. This app replaces the
localStorage admin with PostgreSQL, server-side sessions, and Cloudflare R2 image uploads.
The original Vite app remains at the repository root until the cutover.

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

If you forget the admin password:

```bash
npm run db:admin
```

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. |
| `ADMIN_EMAIL` | Admin login email used by the seed. |
| `ADMIN_PASSWORD` | Admin password used by the seed. Use 12+ characters in production. |
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

1. Create a **PostgreSQL** service in Dokploy. Do not publish its port publicly.
2. Create an application from this repository with base directory `web/` and Dockerfile build.
3. Set the environment variables from the table above. Use the internal Postgres hostname in
   `DATABASE_URL`.
4. Expose container port `3000`, attach the domain, and use `/api/health` as the health check.
5. Deploy. The container runs `migrate.mjs` before starting the server, so migrations are
   applied automatically.
6. On the first deploy, run `node seed.mjs` once in the Dokploy container terminal. It inserts
   the catalog and settings only if the database is empty, and creates the admin user if it is
   missing.
7. To change the admin password later, update `ADMIN_PASSWORD` and run
   `node set-admin-password.mjs` once in the container.
8. Configure PostgreSQL backups in Dokploy to an S3-compatible destination (R2 works).

## Security notes

- Admin login uses bcrypt hashes, database-backed sessions, `httpOnly` cookies, and a login
  rate limit. The session cookie is `secure` in production.
- Every admin server action calls `requireAdmin()`, so hiding the UI is not the protection.
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
