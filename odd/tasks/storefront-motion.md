# Angeles Store's — Storefront motion and cherry blossoms

Objective: add a subtle falling cherry-blossom background and tasteful entrance/motion details across the storefront (hero, catalog, product cards, detail, cart and checkout modals) without hurting readability, performance or accessibility.

Branch: `feat/catalog-experience` (continues PR #8)
Delivery strategy: `single-pr`
Test runner: `vitest` (`cd web && npm test`)

## Specs

- **S1 — Cherry blossoms.** A fixed, pointer-events-none background renders 18 slow-falling petals behind the storefront content (12 on mobile), in the rose palette, with low opacity. The petals are `aria-hidden`, stay behind a `relative z-10` content wrapper, and never cause scroll or block interaction.
- **S2 — Entrance motion.** The hero text fades up, the hero image fades in with a very slow zoom; catalog headers/search/categories/filters fade up; product cards stagger in by index; the product detail gallery fades in and its info fades up; recommendations stagger.
- **S3 — Modal motion.** The cart drawer slides in from the right with a fading backdrop; checkout and order-confirmation dialogs scale/fade in.
- **S4 — Accessibility and performance.** All motion is CSS-only, uses `transform`/`opacity`, respects `prefers-reduced-motion` (petals hidden, animations disabled), and does not introduce layout shift or interaction blockers.

## Tasks

| ID | Specs | Route | Status | Evidence |
| --- | --- | --- | --- | --- |
| T1 | S1 | inline | done | petals component, CSS keyframes, store shell wrapper |
| T2 | S2 | inline | done | hero, catalog, cards, detail animations |
| T3 | S3 | inline | done | drawer/modal keyframes and classes |
| T4 | S4 | inline | done | reduced-motion rules, tests, typecheck, build |

## Log

- **L1 (user, verbatim):** "listo la tienda tiene un estilo muy bueno, ahora hagamos algo que mejorara la experiencia del usuario puedes poner en el fondo ojas de cerezo callendo asi medias tenuees oara que le den un poco de vida al pagina y le demas mas animacion a todo un hero por ejemplo a los productos y asi"
- **L2 (decision):** The petals are a fixed CSS-only background behind a `relative z-10` content wrapper, with 18 petals (12 on mobile) and low opacity; no JavaScript animation loop.
- **L3 (decision):** Entrance animations use `backwards` fill and small delays so the cards keep their hover transforms after the animation ends.
- **L4 (decision):** `prefers-reduced-motion` hides the petals and disables all added animations; the petals are `aria-hidden` and `pointer-events-none`.
- **L5 (verification):** `npm test` → 19 files / 105 tests; `npm run typecheck` clean; `npm run build` green. The homepage SSR contains 18 `petal` spans, the `relative z-10` wrapper and the hero/catalog fade classes; the CSS bundle contains the `petal-fall`, `hero-zoom`, `drawer-in` and `modal-in` keyframes. Visual behavior is verified manually in the browser.
