# Angeles Store's — Order confirmation and private receipt

Objective: after a customer confirms an order, show a confirmation modal with the order summary, a QR to a private receipt page, and copy/open/print actions. The receipt page uses the order UUID as an unguessable link, is `noindex`, and can be printed or saved as PDF.

Branch: `feat/catalog-experience` (continues PR #2)
Delivery strategy: `single-pr`
Test runner: `vitest` (`cd web && npm test`)

## Specs

- **S1 — Confirmation modal.** After `createOrderAction` succeeds, the storefront shows a modal with the order number, date, customer data, items, total, a QR to the private receipt URL, and actions to open the receipt, copy the summary, reopen WhatsApp, or close. The cart clears; the modal offers an "Abrir WhatsApp" action instead of auto-opening the tab, so the customer can review the receipt first.
- **S2 — Private receipt page.** `/pedido/[id]` renders the order receipt from the order UUID. It shows the store name, order number, date, status, payment status, customer, items, total, and shipping note. It is `noindex`, not in the sitemap, and has a "Guardar / imprimir" action that opens the browser print dialog (save as PDF or print).
- **S3 — Data flow.** `createOrderInDb` and `createOrderAction` return the order `id`; the store shell keeps the created order in local state for the modal. The public receipt uses the existing `getOrder` query and does not expose admin actions.
- **S4 — Quality.** Tests, typecheck, build, and smoke of the receipt page pass. The QR dependency is declared in `package.json` and the lockfile.

## Tasks

| ID | Specs | Route | Status | Evidence |
| --- | --- | --- | --- | --- |
| T1 | S3 | inline | done | order id in the action result + action test |
| T2 | S2 | inline | done | private receipt page + print button + print CSS |
| T3 | S1 | inline | done | confirmation modal + QR + copy/open actions |
| T4 | S4 | inline | done | tests, typecheck, build, receipt smoke |

- **T1 — Data flow.** Add `id` to `CreatedOrder` and `CreateOrderResult`; return it from the insert; update the action test mock and assertion.
- **T2 — Receipt page.** Add `/pedido/[id]`, `PrintButton`, and print-only CSS. Use `getOrder`/`getStoreSettings`, `formatPrice`, `orderStatusLabel`, `paymentStatusLabel`, `paymentLabel`. Add `dynamic = "force-dynamic"` and noindex metadata.
- **T3 — Confirmation.** Add `OrderConfirmationModal` with the QR (`react-qr-code`), summary, copy, open receipt, WhatsApp, and close. Wire it into `StoreChrome` after a successful order.
- **T4 — Verify.** Run tests, typecheck, build, and smoke the receipt page with an existing order UUID.

## Log

- **L1 (user, verbatim):** "ok y cuando el usuario confirma el pedido mira es ncesario que le muestre ya sea un QR o algo que pueda descargar o tomar captura para su respaldo"
- **L2 (decision):** The order UUID is the private receipt token; no schema migration is needed. The receipt page is `noindex` and is not added to the sitemap.
- **L3 (decision):** The QR encodes the absolute receipt URL, so scanning it opens the receipt on another device. The modal also shows the full summary for a screenshot.
- **L4 (decision):** "Descargar" uses the browser print dialog (save as PDF or print) from the receipt page; no PDF library is added. The QR uses `react-qr-code` (SVG, no canvas).
- **L5 (decision):** The checkout no longer auto-opens the WhatsApp tab. The order is already stored, so the confirmation modal appears first and its "Abrir WhatsApp" action opens the prepared message on a user gesture. This avoids the WhatsApp tab hiding the receipt/QR and removes the blank-popup workaround.
- **L6 (fix):** The public receipt validates the URL segment as a UUID before calling `getOrder`; malformed ids return 404 instead of reaching Postgres and throwing a 500. The receipt is `noindex` and is not added to the sitemap.
- **L7 (verification):** `react-qr-code` 2.2.0 installed (React 19 compatible, SVG). `npm test` → 15 files / 85 tests; `npm run typecheck` clean; `npm run build` green. Receipt smoke: valid order UUID → 200 with "Comprobante de pedido", "Pedido #2", both items, "Guardar / imprimir" and `noindex`; malformed and unknown UUIDs → 404; sitemap has 0 `/pedido` entries; the client bundle contains the modal/QR strings. Browser-level QR scan, print, and clipboard were not exercised (no browser harness).
