# Firebase push notifications for new orders

Objective: every admin user/device receives a web push notification for each new order using Firebase Cloud Messaging. The app stays on Next.js + PostgreSQL/Dokploy; Firebase is used for push notifications, not hosting. If the Firebase env vars are missing, the store and admin keep working and the push UI shows an unconfigured state.

Branch: `feat/catalog-experience` (continues the admin roles work)
Delivery strategy: `single-pr`
Test runner: `vitest` (`cd web && npm test`)

## Specs

- **S1 — Firebase configuration.** Support `NEXT_PUBLIC_FIREBASE_CONFIG` (Firebase web app config JSON, public), `NEXT_PUBLIC_FIREBASE_VAPID_KEY` (Web Push certificate key, public), and `FIREBASE_SERVICE_ACCOUNT_JSON` (service account JSON, server-only). Missing/invalid config degrades gracefully; the server never fails an order because push is unavailable.
- **S2 — Tokens.** Add `admin_push_tokens` with `userId` (FK cascade), unique `token`, timestamps. Admin-only server actions register/unregister the current device token for the signed-in admin. Tokens are per device; a shared browser reassigns the token to the latest user.
- **S3 — Client.** A Firebase service worker at `/firebase-messaging-sw.js` and a dynamic `/firebase-config` route inject the public config. The admin dashboard shows a "Notificaciones de pedidos" card with an enable/disable button, permission states, and an unconfigured/unsupported message. The service worker opens `/admin/pedidos/<id>` on notification click.
- **S4 — Server.** After a successful order insert, `sendOrderPushNotification` sends a multicast notification to every admin token: title "Nuevo pedido #N", body with customer, item count, and total, data/URL to the admin order detail. Invalid tokens are removed; errors are logged and never fail the order. The order records the push result (`pushSentAt`, `pushSuccessCount`, `pushFailureCount`, `pushError`) and the admin order detail shows it.
- **S5 — Quality.** Pure notification/token tests, typecheck, build, migration, and smoke with missing config plus the fake-token table path.

## Tasks

| ID | Specs | Route | Status | Evidence |
| --- | --- | --- | --- | --- |
| T1 | S1 | inline | done | env/config helpers + graceful fallback |
| T2 | S2 | inline | done | token table, migration, register/unregister actions |
| T3 | S3 | inline | done | service worker, config route, dashboard card |
| T4 | S4 | inline | done | order notification + invalid-token cleanup + push result on the order |
| T5 | S5 | inline | done | tests, typecheck, build, migration, smoke |

- **T1 — Config.** Add `lib/push.ts` helpers: `isPushConfigured`, `parseServiceAccount`, `isValidPushToken`, `buildOrderNotification`. Lazy-load `firebase-admin` so tests do not initialize it.
- **T2 — Tokens.** Add `adminPushTokens` to the schema and migration `0006_*`; queries `listPushTokens`, `registerPushToken`, `deletePushToken`, `deletePushTokens`; admin actions `registerPushTokenAction` / `unregisterPushTokenAction` with `requireAdmin`.
- **T3 — Client.** Install `firebase` and `firebase-admin`. Add the service worker, the `/firebase-config` route, `PushNotifications` client component, a bell icon, and the dashboard card.
- **T4 — Send.** Call `sendOrderPushNotification` after a successful `createOrderInDb` in `createOrderAction`, fire-and-forget with a catch. Use the order id/number, customer name, item count, and total. Delete invalid tokens from the multicast response.
- **T5 — Verify.** Run tests/typecheck/build, generate/apply the migration, verify `/firebase-config` and the service worker, verify the dashboard unconfigured state, and verify a fake token row can be inserted/deleted. Actual FCM delivery requires the user's Firebase credentials and a browser.

## Log

- **L1 (user, verbatim):** "ok, vamos a agregar algo muy importante que son las push notification para los usuarios del sistema por cada uno de los pedidos, y vamos hacer la app en firebase, yo te pasare el json en una variable de entorno"
- **L2 (assumption):** Firebase is used for Cloud Messaging web push; the Next.js/Postgres app stays on Dokploy. Migrating hosting to Firebase is a separate decision.
- **L3 (decision):** Three env vars are required for web push: the public web app config JSON, the public VAPID key, and the server-only service account JSON. The user will provide the service account JSON; the web config and VAPID key come from the Firebase console.
- **L4 (decision):** Every admin role (owner and staff) receives order notifications. Tokens are per device; a shared browser reassigns the token to the latest signed-in admin.
- **L5 (decision):** Push is best-effort: missing config, FCM errors, or invalid tokens never fail an order.
- **L6 (open question):** Firebase hosting/App Hosting migration is not part of this feature; it needs a separate decision because the app uses Next.js server actions and PostgreSQL.
- **L7 (verification):** `npm test` → 19 files / 103 tests; `npm run typecheck` clean; `npm run build` green; migration `0006_sweet_invaders` applied with the `admin_push_tokens` table, unique token, cascade FK and user index. Without Firebase env, `/firebase-config` returns `self.FIREBASE_CONFIG = null;`, `/firebase-messaging-sw.js` returns 200, and `/admin` shows "Firebase no está configurado." With a fake public config on a temporary production server, `/firebase-config` returns the JSON and the dashboard shows "Activar notificaciones". Fake token rows were inserted/read/deleted through SQL and the query layer; no test tokens remain.
- **L8 (pending external test):** Actual FCM delivery is not testable without the user's real VAPID key, service account JSON, HTTPS (or localhost) and a browser permission grant. The user provided the public web app config for project `angelesstore-506fa`; the VAPID key and service account JSON are still needed in the environment.
- **L9 (security):** The service account JSON is server-only (`FIREBASE_SERVICE_ACCOUNT_JSON`) and must be set directly in `.env`/Dokploy, never pasted into chat or committed. The web config and VAPID key are public and are inlined at build time, so changing them requires a rebuild.
- **L10 (user, verbatim):** "como sabemos que se fue la notificacion"
- **L11 (implementation):** Added `pushSentAt`, `pushSuccessCount`, `pushFailureCount`, and `pushError` to `orders` (migration `0007_hesitant_scarlet_spider`). `sendOrderPushNotification` now records skipped, sent, partial, and failed results. The admin order detail has a "Notificación" card showing "Enviada a X dispositivo(s)", "falló en Y", "No se envió: <motivo>", or "Sin intento registrado", with the timestamp. Server logs now include `[push] order #N: success=... failure=... invalid=...` or a skipped reason.
- **L12 (verification):** `npm test` → 19 files / 104 tests; `npm run typecheck` clean; `npm run build` green; migration `0007_hesitant_scarlet_spider` applied. Simulated order #2 with `pushSentAt`/2 successes showed "Enviada a 2 dispositivo(s)."; with a skipped error it showed "No se envió: Sin dispositivos suscritos."; the order fields were reverted afterwards. FCM success confirms the push was accepted for the token, not that the person saw it.
