# Angeles Store's — Order confirmation and private receipt

Objective: after a customer confirms an order, show a confirmation modal with the order summary, a QR to a private receipt page, and copy/open/print actions. The receipt page uses the order UUID as an unguessable link, is `noindex`, and can be printed or saved as PDF.

Branch: `feat/catalog-experience` (continues PR #3)
Delivery strategy: `single-pr`
Test runner: `vitest` (`cd web && npm test`)

## Specs

- **S1 — Confirmation modal.** After `createOrderAction` succeeds, the storefront shows a modal with the order number, date, customer data, items, total, a QR to the private receipt URL, and actions to open the receipt, copy the summary, reopen WhatsApp, or close. WhatsApp opens automatically in a new tab after the order is stored; the confirmation modal remains available in the store tab with the QR and an "Abrir WhatsApp" fallback.
- **S2 — Private receipt page.** `/pedido/[id]` renders the order receipt from the order UUID. It shows the store name, order number, date, status, payment status, customer, items, total, and shipping note. It is `noindex`, not in the sitemap, and has a "Guardar / imprimir" action that opens the browser print dialog (save as PDF or print).
- **S3 — Data flow.** `createOrderInDb` and `createOrderAction` return the order `id`; the store shell keeps the created order in local state for the modal. The public receipt uses the existing `getOrder` query and does not expose admin actions.
- **S4 — Quality.** Tests, typecheck, build, and smoke of the receipt page pass. The QR dependency is declared in `package.json` and the lockfile.
- **S5 — Admin receipt QR.** The admin order detail shows the receipt QR and a link to open the private receipt, so the order and its customer receipt stay related.

## Tasks

| ID | Specs | Route | Status | Evidence |
| --- | --- | --- | --- | --- |
| T1 | S3 | inline | done | order id in the action result + action test |
| T2 | S2 | inline | done | private receipt page + print button + print CSS |
| T3 | S1 | inline | done | confirmation modal + QR + copy/open actions |
| T4 | S4 | inline | done | tests, typecheck, build, receipt smoke |
| T5 | S5 | inline | done | admin order detail QR + open receipt link |

- **T1 — Data flow.** Add `id` to `CreatedOrder` and `CreateOrderResult`; return it from the insert; update the action test mock and assertion.
- **T2 — Receipt page.** Add `/pedido/[id]`, `PrintButton`, and print-only CSS. Use `getOrder`/`getStoreSettings`, `formatPrice`, `orderStatusLabel`, `paymentStatusLabel`, `paymentLabel`. Add `dynamic = "force-dynamic"` and noindex metadata.
- **T3 — Confirmation.** Add `OrderConfirmationModal` with the QR (`react-qr-code`), summary, copy, open receipt, WhatsApp, and close. Wire it into `StoreChrome` after a successful order.
- **T4 — Verify.** Run tests, typecheck, build, and smoke the receipt page with an existing order UUID.

## Log

- **L1 (user, verbatim):** "ok y cuando el usuario confirma el pedido mira es ncesario que le muestre ya sea un QR o algo que pueda descargar o tomar captura para su respaldo"
- **L2 (decision):** The order UUID is the private receipt token; no schema migration is needed. The receipt page is `noindex` and is not added to the sitemap.
- **L3 (decision):** The QR encodes the absolute receipt URL, so scanning it opens the receipt on another device. The modal also shows the full summary for a screenshot.
- **L4 (decision):** "Descargar" uses the browser print dialog (save as PDF or print) from the receipt page; no PDF library is added. The QR uses `react-qr-code` (SVG, no canvas).
- **L5 (decision):** The first iteration showed the modal first and left WhatsApp behind an explicit button. The user requested the automatic WhatsApp flow in L8, so L9 restores it while keeping the modal and QR.
- **L6 (fix):** The public receipt validates the URL segment as a UUID before calling `getOrder`; malformed ids return 404 instead of reaching Postgres and throwing a 500. The receipt is `noindex` and is not added to the sitemap.
- **L7 (verification):** `react-qr-code` 2.2.0 installed (React 19 compatible, SVG). `npm test` → 15 files / 85 tests; `npm run typecheck` clean; `npm run build` green. Receipt smoke: valid order UUID → 200 with "Comprobante de pedido", "Pedido #2", both items, "Guardar / imprimir" and `noindex`; malformed and unknown UUIDs → 404; sitemap has 0 `/pedido` entries; the client bundle contains the modal/QR strings. Browser-level QR scan, print, and clipboard were not exercised (no browser harness).
- **L8 (user, verbatim):** "ok pero ya no habre wahtsapp automatico eso siempre porque el pedido lo hace desde ahi"
- **L9 (implementation):** Restored the pre-opened blank tab and the navigation to the WhatsApp URL after the order is stored. The confirmation modal with the QR/receipt stays in the store tab, and its "Abrir WhatsApp" button remains as a fallback if the popup was blocked or closed.
- **L10 (verification):** `npm run typecheck` clean, `npm test` → 15 files / 85 tests, `npm run build` green. The popup flow is client-side and has no browser test; it is verified by code review and build.
- **L11 (user, verbatim):** "sabes flato poner en pedidos el QR para que tengamos relacinado eso"
- **L12 (implementation):** Added `OrderReceiptQr` (client SVG QR) to the admin order detail. The card shows the QR for `${SITE_URL}/pedido/${order.id}`, an explanation, and an "Abrir comprobante" link. The QR is rendered server-side as SVG.
- **L13 (verification):** `npm run typecheck` clean, `npm test` → 15 files / 85 tests, `npm run build` green. Authenticated smoke on order #2: the detail contains "Comprobante del cliente", the `/pedido/<uuid>` URL, 3 SVGs including the QR, and the "Abrir comprobante" link.
