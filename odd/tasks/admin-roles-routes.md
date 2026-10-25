# Angeles Store's — Admin roles and sectioned routes

Objective: add two admin roles (`owner`, `staff`) and split the admin into a dashboard, products, orders, store settings, and user-management routes, with server-side role guards.

Branch: `feat/catalog-experience` (continues PR #5)
Delivery strategy: `single-pr`
Test runner: `vitest` (`cd web && npm test`)

## Specs

- **S1 — Roles.** `admin_users.role` is an enum (`owner`, `staff`), not null, default `staff`. The migration promotes existing admin rows to `owner`. The seed creates the first admin as `owner`. New users created from the UI default to `staff` unless the owner chooses `owner`.
- **S2 — Server-side guards.** The session includes the role. `requireAdmin` keeps returning the session; `requireOwner` redirects unauthenticated users to login and non-owners to `/admin?error=forbidden`. Store settings and user management are owner-only at the page and server-action layers. Products and orders remain available to both roles.
- **S3 — Routes and tabs.** `/admin` is a dashboard (summary + recent orders + quick links). `/admin/productos` is the product list. `/admin/pedidos` stays. `/admin/tienda` is the store settings page (replaces `/admin/ajustes`, which redirects). `/admin/usuarios` is the owner-only team page. Tabs are Resumen, Productos, Pedidos, Tienda (owner), Usuarios (owner); staff never sees the owner-only tabs.
- **S4 — User management.** Owners can list users, create a user (email, password 12+, role), change a role, reset a password, and delete a user. The last owner cannot be demoted or deleted; an owner cannot delete their own account. Passwords use bcrypt 12; emails are normalized lowercase. Deleting a user cascades their sessions.
- **S5 — Quality.** Role helper tests, typecheck, build, migration, and an owner/staff smoke test pass.

## Tasks

| ID | Specs | Route | Status | Evidence |
| --- | --- | --- | --- | --- |
| T1 | S1 | inline | done | role enum/column, migration `0005_nasty_roughhouse`, seed/script |
| T2 | S2 | inline | done | session role + requireOwner + action guards |
| T3 | S3 | inline | done | dashboard, products route, tienda route, tabs |
| T4 | S4 | inline | done | user list/create/role/password/delete |
| T5 | S5 | inline | done | tests, typecheck, build, migration, owner/staff smoke |

- **T1 — Roles.** Add the `admin_role` enum and `admin_users.role`; generate the migration and add `UPDATE admin_users SET role = 'owner'`; update the seed scripts to insert `owner`; keep the password-reset scripts compatible.
- **T2 — Auth.** Add `AdminRole`, role helpers, `AdminSession.role`, and `requireOwner`. Guard `saveSettingsAction` and the user actions with `requireOwner`; keep product/order actions on `requireAdmin`.
- **T3 — Routes.** Move the product list to `/admin/productos`; make `/admin` a dashboard with the summary and recent orders; move settings to `/admin/tienda` with an `/admin/ajustes` redirect; update all redirects/links; filter and restyle the tabs.
- **T4 — Users.** Add owner-only queries and actions plus the `/admin/usuarios` UI: create form, role select, password reset, delete with confirmation, last-owner/self protections, and success/error banners.
- **T5 — Verify.** Run tests, typecheck, build, generate/apply the migration, and smoke owner/staff access.

## Log

- **L1 (user, verbatim):** "ok eso esta bien, agregemos algo importante, 2 cosas que hay que mejorar en la parte del admin, vamos a crear roles y crear una ruta para la tienda, otra ruta para los usuarios otra donde gestione los productos y pedidos"
- **L2 (assumption):** The two roles are `owner` (everything) and `staff` (dashboard, products, orders; no store settings or user management). This matches the dependienta use case. More granular roles can be added later.
- **L3 (decision):** `/admin` becomes a dashboard; the product list moves to `/admin/productos`; settings move to `/admin/tienda`; `/admin/ajustes` redirects to `/admin/tienda`; `/admin/usuarios` is new and owner-only.
- **L4 (decision):** Existing admin rows become `owner` in the migration so the current login is not locked out. New UI-created users default to `staff`.
- **L5 (decision):** The last owner cannot be demoted or deleted; an owner cannot delete their own account. Passwords require 12+ characters, matching the production script.
- **L6 (implementation):** Added `admin_role` (`owner`, `staff`) with migration `0005_nasty_roughhouse` and an owner backfill; `AdminSession.role` and `requireOwner`; the five admin routes; role-aware tabs; owner-only `/admin/tienda` and `/admin/usuarios`; and the full user-management flow (create, change role, reset password, delete with last-owner/self protections).
- **L7 (verification):** `npm test` → 16 files / 88 tests; `npm run typecheck` clean; `npm run build` green; migration applied and `admin@angelesstore.local` is `owner`. Owner smoke: `/admin`, `/admin/productos`, `/admin/pedidos`, `/admin/tienda`, `/admin/usuarios` all 200; `/admin/ajustes` redirects to `/admin/tienda`; all five tabs render. Staff smoke (temporary user): dashboard/products/orders 200; tienda/users redirect to `/admin?error=forbidden`; tabs hide owner-only sections; direct staff POSTs to the owner actions are rejected. The temporary staff user was deleted; the final DB has only the owner.
- **L8 (limitations):** Last-owner checks are application-level count checks, not row-locked; a rare concurrent demotion/delete could race. More granular roles can be added later. `set-admin-password` creates a new user as `staff` unless `ADMIN_ROLE` is passed; when `ADMIN_ROLE` is explicitly set for an existing email, it also updates the role. Without it, existing emails only get a password change.
- **L9 (user, verbatim):** "mira en la pantalla de usuarios los selected son nativos y ya tenemos un disenio"
- **L10 (implementation):** Replaced the native role selects in the create-user form and the per-user role row with the shared `Select` component (field and pill variants). Also fixed the verifier's `ADMIN_ROLE` blocker: an explicitly provided role now updates an existing email instead of being silently ignored. The duplicate-email message now reads Drizzle's wrapped `cause.code` and returns "Ya existe un usuario con ese email.".
- **L11 (verification):** `npm test` → 16 files / 88 tests; `npm run typecheck` clean; `npm run build` green. The shared selects render in the users screen; `ADMIN_ROLE` behavior and the duplicate-email message are covered by code review and the verifier's probes.
