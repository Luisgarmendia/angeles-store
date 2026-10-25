# Angeles Store's — Admin notification center

Objective: when a new order arrives, every admin gets an in-app notification in the admin panel, independent of Firebase push. The admin header shows a bell with an unread count, a panel with the latest notifications, read/unread state, a toast for new notifications while the panel is open, and links to the admin order detail. The existing OS push remains for when the admin is away.

Branch: `feat/catalog-experience` (continues PR #6)
Delivery strategy: `single-pr`
Test runner: `vitest` (`cd web && npm test`)

## Specs

- **S1 — Notification records.** Add `admin_notifications` with `userId` (cascade), `orderId` (cascade), `title`, `body`, `url`, `readAt`, `createdAt`, and a `userId + createdAt` index. Each new order creates one row per admin user.
- **S2 — Notification center.** The admin header has a bell with an unread badge. The panel shows the latest 20 notifications, read/unread dots, relative/short dates, "Marcar todas", and opens the admin order detail on click. It polls every 15 seconds, closes on outside click/Escape, and shows a toast for a new notification when the page is open. A foreground Firebase `onMessage` listener also shows the toast and refreshes the bell immediately, so the admin sees the alert while browsing any admin page.
- **S3 — Order pipeline.** `notifyNewOrder` creates the in-app rows for all admins, then calls the existing `sendOrderPushNotification`. In-app creation is independent of Firebase and never fails the order. The in-app link is `/admin/pedidos/<id>`; the OS push keeps the public `/pedido/<id>` link.
- **S4 — Quality.** Unit/type/build checks, migration, and smoke of the table/query layer. The bell is client-rendered; the panel requires a browser to inspect.

## Tasks

| ID | Specs | Route | Status | Evidence |
| --- | --- | --- | --- | --- |
| T1 | S1 | inline | pending | schema, migration, queries |
| T2 | S2 | inline | pending | bell, panel, polling, toast, read state |
| T3 | S3 | inline | pending | notifyNewOrder + order action + action test |
| T4 | S4 | inline | pending | tests, typecheck, build, migration, smoke |

- **T1 — Data.** Add `adminNotifications` after `orderItems` (it references `orders`), queries `listAdminUserIds`, `createAdminNotifications`, `listAdminNotifications`, `countUnreadNotifications`, `markNotificationsRead`, `markAllNotificationsRead`. Generate/apply `0008_*`.
- **T2 — UI.** Add `NotificationBell` to the admin protected layout; actions `listAdminNotificationsAction`, `markNotificationsReadAction`, `markAllNotificationsReadAction` with `requireAdmin`. Use the existing `BellIcon`, `ToastProvider`, and visual language.
- **T3 — Pipeline.** Create `lib/notifications.ts` with `createInAppOrderNotifications` and `notifyNewOrder`; the order action lazily imports `notifyNewOrder` instead of calling push directly. Update `actions.test.ts` to mock/assert `notifyNewOrder`.
- **T4 — Verify.** Run tests, typecheck, build, migration, SQL table checks, and bundle-string checks. Actual panel interaction needs a browser.

## Log

- **L1 (user, verbatim):** "ok pero si estoy en la paguina web deberia de tambien recibir la notificacion mejor hamos el centro de notirificaiones"
- **L2 (decision):** The notification center is per admin user, with read state, latest 20, a 15-second poll, and a toast for new items while the page is open. The OS push stays for when the admin is away.
- **L3 (decision):** In-app notifications are created for every admin regardless of Firebase configuration; the order is never blocked by notification failures.
- **L4 (decision):** The in-app link opens the admin order detail; the OS push link remains the public receipt.
- **L5 (user, verbatim):** "pero igual que escuche el fire base para que cuando llegue recibir una alerta o notificacion"
- **L6 (implementation):** Added a shared `push-client` config/messaging helper, a `ForegroundPushListener` mounted in the admin protected layout, and a `push:ready` event after token registration. `onMessage` shows an in-app toast with a "Ver" action and dispatches `admin-notifications:refresh`; the bell listens to that event and refreshes immediately instead of waiting for the 15-second poll.
- **L7 (verification):** `npm run typecheck` clean, `npm test` → 19 files / 105 tests, `npm run build` green. The foreground listener, toast, and refresh event are in the client bundle; a real foreground message still needs a browser test with the configured Firebase project.
- **L8 (user, verbatim):** "ok, la campanita no se ve bien en moviles sale a un lado de la pantalla"
- **L9 (implementation):** The admin header stacks on mobile: the title is on its own row and the bell + "Ver tienda" + "Salir" go below in a full-width wrapping row, with the bell first. The notification panel opens to the right on mobile (`left-0`, `sm:right-0` on desktop) and keeps the viewport max-width, so it no longer runs off-screen.
- **L10 (verification):** `npm run typecheck` clean, `npm test` → 19 files / 105 tests, `npm run build` green. The authenticated admin HTML contains the stacked header classes and the bell; the panel responsive class is in the client bundle. Mobile visual check remains manual.
