# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FeatherBase is a Pokédex-style database of Indian bird species. Each bird has a serial number (#0001, #0002, etc.) and detailed field data. Express 5 + MongoDB backend with a Vue 3 frontend in `web/`. Deployed on Netlify (frontend as static site, backend as serverless function).

## Commands

- **Backend only (watch):** `pnpm dev:BE` (Node `--watch` + `.env`)
- **Frontend only:** `pnpm dev:FE` (Vite on port 8000, proxies `/v1.0/*` and `/_health` to localhost:8888)
- **Full dev:** `pnpm dev` (backend + frontend via concurrently, backend without `--watch`)
- **Production:** `pnpm start` (env from platform, no `.env`)
- **Build frontend:** `pnpm build:FE` (runs pnpm install + build inside `web/`)
- **Lint & fix:** `pnpm lint:fix` (ESLint with airbnb-base, also runs as pre-commit hook via Husky)
- **Verify birds:** `pnpm verify-birds "1-10"` or `pnpm verify-birds "[23,56,67]"`
- **Insert birds:** `pnpm insert-birds "56-60"` or `pnpm insert-birds "[56,58,60]"`

There are no tests configured.

## Environment Variables

Configured via `convict` in `src/config.js`. Loaded from `.env` via Node's native `--env-file` flag (no dotenv package). Copy `.env.template` → `.env` and fill in values. Key vars: `PORT` (default 8888), `NODE_ENV`, `MONGO_DB` (connection string), `MODE` (server), `DEBUG`, `SERVICE_NAME`, `ADMIN_TOKEN` (secret for admin write endpoints — generate with `openssl rand -hex 32`, pass as `Authorization: Bearer <token>` or `X-Admin-Token` header).

## Architecture

- **ES Modules** throughout (`"type": "module"` in package.json)
- **Path aliases** via Node.js subpath imports: `#config`, `#logger`, `#models/*`, `#services/*`, `#controllers/*`, `#middlewares/*`, `#routes/*`, `#utils/*`, `#validators/*`
- **Logger:** `src/utils/logger.js` — Winston-based, file-namespaced via `loggerManager(file)`. In development: colorized single-line pretty format `[HH:mm:ss] level (file) message`. In production (`NODE_ENV=production`): compact JSON `{ time, level, msg, file, meta? }` (meta key omitted when absent). Log level is `debug` when `DEBUG=true`, otherwise `info`. Request logger emits `→ METHOD /path` on ingress and `✅/⚠️/💥 STATUS ← METHOD /path` on response finish.
- **Layered architecture:** Routes (`src/routes/`) -> Joi validation middleware (`src/middlewares/apiValidator.js`) -> Controllers (`src/controllers/`) -> Services (`src/services/`) -> Models (`src/models/`)
- **BaseRepository pattern:** `src/models/baseRepository.js` wraps Mongoose with `get()`, `getOne()`, `create()`, `aggregate()`, `update()`. `update(query, updateObj, options)` uses `findOneAndUpdate` and returns the updated document. Individual models (e.g., `birdBasicModel.js`, `metaModel.js`) extend it.
- **Constants:** shared backend constants live in `src/constants/common.js` under the `CONSTANTS` object. CDN values (`cdn.HOST`, `cdn.HOST_URL`, `cdn.IMAGES_BASE`) are the single source of truth used by the service, controller, and Helmet CSP — never hardcode the GitHub Pages URL again.
- **API base path:** `/v1.0/birds` - routes defined in `src/routes/birdRouter.js`
- **API search:** `GET /v1.0/birds?search=<term>` does case-insensitive regex on `name` and `scientificName`. The list endpoint returns `{ id, serialNumber, name, scientificName, commonGroup }` — no images (meta join skipped for performance).
- **Groups API:** `GET /v1.0/birds/groups` returns `{ title: string, count: number }[]` sorted by count descending (uses MongoDB aggregation, not `distinct`). Frontend renders count badges on group chips.
- **Admin update API:** `PATCH /v1.0/birds/:id` — requires `Authorization: Bearer <ADMIN_TOKEN>` or `X-Admin-Token` header. Body is a partial bird object; only fields in `PATCHABLE_FIELDS` (defined in `birdService.js`) are applied. The `verification` field is merged at sub-key level via dot-notation so sibling keys are never overwritten. Returns 401 if token is missing/wrong, 503 if `ADMIN_TOKEN` env var is not set.
- **Admin auth middleware:** `src/middlewares/adminAuth.js` — checks the token and short-circuits with the appropriate status code.
- **Frontend:** Vue 3 + Vite + UnoCSS app in `web/`, built output served as static files from `web/dist/`. Uses file-based routing (unplugin-vue-router), auto-imports (unplugin-auto-import), and Phosphor icons (@iconify-json/ph).
- **Middleware chain** (in order): timeout (30s), Helmet (CSP whitelists GitHub Pages CDN via `CONSTANTS.cdn.HOST_URL`), body parsers, request logger, routes, 404 handler, error handler. Sentry was removed — re-add when needed.
- **Data pipeline:** Bird data is generated via LLM prompts (see README), stored as JSON in `data/birds/`, and bulk-inserted via `src/scripts/insert-birds.js`. Run with `pnpm insert-birds` (uses `.env`) — the connect/run block is guarded by an ESM main-module check so importing the file elsewhere is safe.
- **Image delivery:** Dual mode via `VITE_IMG_DELIVERY_MODE` — `online` constructs GitHub Pages CDN URLs from the `file` field in the meta collection (`https://sagnikb7.github.io/featherbase-images/assets/images/optimised_birds/<file>`), `offline` serves from `public/images/birds/` (gitignored). The API response exposes `cdn` (not `url`) on each image object; `cdn` is `null` if `file` is missing. Images are only loaded on the detail page, not the list.
- **Bird schema notable fields:** `speciesCode` (eBird species code, string), `verification` (schema-less `Mixed` JSON — sub-keys written via dot-notation to prevent sibling overwrites). Verification shape per sub-key: `{ verified: boolean, date: "YYYY-MM-DD" }` for matches; `{ verified: false, mismatch: { db, csv }, date }` for conflicts.
- **eBird verification script:** `src/scripts/verify-birds.js` — cross-references DB records against `DataCollector/ebird.csv`. Sets `speciesCode`, verifies/corrects `scientificName`, `order`, `family`, `commonGroup`, and writes the `verification` field. Run as `pnpm verify-birds "34-67"` (range) or `pnpm verify-birds "[23,56,67]"` (array). Logs written to `DataCollector/logs/verify-<ts>.json`.

## Deployment

**Netlify (primary):**
- `netlify.toml` at project root configures the build
- Frontend: static site from `web/dist/`
- Backend: serverless function at `netlify/functions/api.mjs` wraps Express via `serverless-http`
- Redirects proxy `/v1.0/*` and `/_health` to the function
- `src/app.js` skips static file serving when `process.env.NETLIFY` is set

**Render (alternative):**
- `render.yaml` at project root — single web service (Node 22, Singapore region)
- Build: `npx pnpm@latest install && npm run build:FE`; Start: `node index.js`
- Auto-deploys on commit; `MONGO_DB` must be set as a secret env var in the Render dashboard

## Frontend Design System

"The Digital Curator" — deep forest & earth tones with paper grain texture.

- **Tokens:** `web/src/styles/tokens.css` — all colors, typography, spacing, shadows, transitions, grain texture
- **Fonts:** Manrope (sans), Newsreader (serif/display), DM Mono (mono)
- **Components use CSS custom properties, not utility classes** for colors/spacing. UnoCSS is used for icons (`i-ph-*`) and some layout utilities in templates.
- **Two layout modes — this is a hard rule:**
  - **Browse mode** (home, settings, any future list pages): `max-width: 720px`, centered, single-column. The bottom nav also caps at 720px. All browse pages must stay within this shell.
  - **Detail mode** (bird detail page): `max-width: 1024px`, centered, two-column grid (image | info) on desktop. This wider shell is intentional — it's an immersive dossier experience distinct from the list view. Must not exceed 1024px; must not shrink to 720px (would make columns too narrow for a photo).
  - Never introduce a page that breaks either constraint without documenting it here.
- **Mobile-first:** bottom navigation bar (iOS-style) with Birds + Settings links — no inline dark-mode toggle. `TheHeader.vue` was removed; home page has an inline `.page-hero` header instead. Mobile detail page has organic overlap (intro panel slides over image with rounded top corners).
- **Page transitions:** Vue `<Transition>` with fade + drift, respects `prefers-reduced-motion`
- **IUCN status chips:** colored dot + code + label, pulse animation on critical statuses
- **Group color hashing:** `web/src/composables/groupColor.ts` — deterministic djb2 hash maps `commonGroup` names to a 10-color earthy palette. Same color on list and detail pages.
- **Home page:** inline hero header (logo + title + tagline), bird-of-the-day card (seeded by `Math.floor(Date.now() / 86400000) % total`), compact Pokédex-style rows (no images), API-powered search with debounced dropdown (300ms; triggers at 1 char for pure-numeric queries, 3 chars for text), group filter chips (up to 8, seeded-shuffled daily so they rotate without being random per visit). Search dropdown is `position: absolute` on all screen sizes — no mobile bottom-sheet override.
- **BOTD card microinteractions:** entrance slide-up animation (0.5s ease-out) + one-shot diagonal shimmer sweep (2.2s, fires 0.5s after entrance) + persistent `box-shadow` glow keyed to `--botd-accent` (group color, 12% opacity, 20% on hover). All three suppressed by `prefers-reduced-motion`. BOTD serial is saved to `sessionStorage` via `web/src/composables/botd.ts` (`saveBotdSerial` / `isBotd`) so the detail page can show a "Bird of the Day" chip without a separate API call.
- **BOTD detail chip:** `<span class="botd-chip">` with sun-horizon icon, bounce-in animation (0.5s spring), shown when `isBotd(currentBird.serialNumber)` is true. Uses the site accent color, sits alongside IUCN and rarity chips in `.bird-badges`.
- **Bird list row layout:** name on the first line (full width); second line shows `#0001 · Scientific name` inline — serial in mono, separator `·`, then italic scientific name. Group tag visible on desktop (≥640px), hidden on mobile to prevent cramping. The `--row-accent` / `--row-accent-bg` CSS custom properties carry the group color onto the row hover state regardless.
- **Serial format:** `formatSerial()` in `web/src/composables/format.ts` — 4-digit zero-padded (`#0001`, not `#001`)
- **Detail page:** image carousel with swipe support, dot indicators, image tags (adult/juvenile/male/female — "default" tag hidden). Prev/next bird navigation is in the intro panel, not on the image. Share button is a full-width `.bird-share-cta` CTA below the identity block (not inline in the nav row). Loader is animated dots, not the feather SVG.
- **Panel backgrounds:** accent-tinted (5% forest green in light, 6% mint in dark) with `--surface-gradient` overlay and a 2px accent-derived top border — branded surface, not generic gray.
- **Elevation system:** `--shadow-xs / sm / md / lg` (upward-scaled opacity for dark mode) + `--shadow-up-sm` for bottom nav. Dark values are 3–4× the light opacity. Never use raw `box-shadow` values for UI chrome — always use these tokens.
- **Surface gradient:** `--surface-gradient` (linear, white 4% → transparent) adds subtle dimensionality to panels without a second color. Dark variant uses 2.5%.
- **Typography floor:** no `font-weight` below 400 anywhere (300 is invisible in dark mode), no text below 11px. These are hard rules, not guidelines.

### Theme system
- `web/src/composables/settings.ts` — reactive `settings` object (`theme`, `midnightUnlocked`) persisted to `localStorage` under `featherbase-settings`. Exports `setTheme()`, `unlockMidnight()`, `isDark` computed.
- **Themes:** `light`, `dark`, `auto` (follows system), `midnight` (deep violet, locked by default). `midnight` adds the `midnight` class to `<html>` on top of `dark`.
- **Midnight unlock:** only available after the user taps "Spread the Word" in Settings, which triggers `shareBirdCard()` for the bird of the day and then calls `unlockMidnight()` + `fireUnlockConfetti()`.
- **Midnight tokens:** defined in `tokens.css` under `.dark.midnight` — deep violet base (`#09091a`), violet accent (`#a78bfa`), matching shadows.
- `web/src/composables/confetti.ts` — `fireUnlockConfetti()` using `canvas-confetti`, violet + mint palette, 4-burst sequence.

### Settings page
- Route: `/settings` — `web/src/pages/settings.vue`
- **Section order:** Appearance → Community (hidden after midnight unlock) → Install (hidden when already installed/standalone) → Storage → About
- Theme picker: 3-column grid for light/dark/auto; midnight is a full-width special row with shimmer animation (`.theme-option--midnight`), hidden until unlocked
- **Install section** (`composables/pwaInstall.ts`): `beforeinstallprompt` is captured in `App.vue` on mount (module-level singleton so it survives navigation). On Android/Chrome/Edge shows a compact `settings-card` row with an "Install" pill button that triggers the native dialog. On iOS shows the same row with a "Safari: Share → Add to Home Screen" hint. Section hidden when `display-mode: standalone` or `appinstalled` fires.
- **Clear Cache button** (Storage section): deletes all Cache Storage entries, unregisters the service worker, then reloads — re-registers the SW fresh. Shows live cache size by iterating Cache Storage entries and summing `arrayBuffer.byteLength` (NOT `navigator.storage.estimate()` — that includes localStorage and would never show zero). Label disappears when cache is empty. Amber-toned, uses the spread-card pattern.
- Styles: `web/src/styles/components/settings.css`

### Rarity system
- `web/src/composables/rarity.ts` — 5 tiers: Common (1) → Legendary (5). Each tier has a `label`, `color`, `bg`, and `glow` for light and dark variants.
- Visual treatment on detail page: colored rarity badge with star, glow intensifies with tier.
- Share card accent colors (in `shareCard.ts`) are separate from rarity.ts colors — the card always uses the dark-optimized TIERS palette.

### Share card
- `web/src/composables/shareCard.ts` — Canvas API, always dark (no theme branching).
- **Dimensions:** 630×880 logical, rendered at 2× (1260×1760px). No rounded corners on card.
- **Layout:** bird image fills top 55% (cover crop), hard cut to info section (2px accent-colored shelf line at the boundary). Serial pill top-left of image. Two-column metadata (right-aligned labels, left-aligned values).
- **Tier backgrounds:** Each rarity tier has a distinct deeply-saturated dark background — Common is deliberately near-black (`#0D0D0D`/`#141414`, no effects, no glow). Higher tiers get rich hued bases (teal, violet, amber, ember). The `TIERS` constant in shareCard.ts is the single source of truth for `base`, `surface`, and accent behavior per tier.
- **Rarity accent:** 5 tiers each get one accent color (`#7A8B7A` sage → `#FF6B35` coral). Higher tiers apply the accent to progressively more elements (serial → divider → name). Bottom glow only appears on tiers 2+.
- **Label contrast:** `GREY_DIM` (`#787878`) is used for metadata labels — intentionally lighter than typical dim-grey to maintain legibility on dark hued surfaces.
- **Image loading:** tries CDN URL directly first (GitHub Pages is CORS-permissive), falls back to `/v1.0/birds/image-proxy?url=...` (proxy allows `sagnikb7.github.io`).
- **BOTD share card treatment:** `generateCard` and `shareBirdCard` accept an optional `botd = false` flag. When true: (1) a "✦ TODAY" gold pill (`BOTD_GOLD = #F5C518`) appears top-right of the image, mirroring the serial pill; (2) a "✦ BIRD OF THE DAY · DD MMM YYYY" gold eyebrow is drawn in the info section above the bird name, with 1.5px letter-spacing. `BOTD_GOLD` is intentionally distinct from all rarity tier accents. Both the detail page share button and Settings "Spread the Word" pass the flag.
- **Sharing:** Web Share API with PNG file; falls back to `<a download>` if not supported.
- **Dev tool:** `web/src/pages/test-cards.vue` — fetches one real bird per rarity tier from the API and bulk-generates/downloads all 5 cards. Route is present but commented out in `web/typed-router.d.ts` (dev-only, not linked in the UI).

## PWA

The app is installable as a Progressive Web App:
- `web/public/manifest.json` — app manifest with name, theme color, icons
- `web/public/sw.js` — two caches: `featherbase-v3` (static assets, cache-first) and `featherbase-api-v3` (API responses). Bump both version suffixes to force a full cache wipe on deploy.
- `web/public/favicon.svg` — feather logo (adapts to dark mode via `prefers-color-scheme`)
- `web/public/logo.svg` — maskable icon (forest green background, mint feather)
- **Caching strategy:** home-page API routes (groups, bird-by-id, bird list without search) use stale-while-revalidate with a 5-min TTL — navigating away and back does not re-hit the API. Search results are always network-first. On SW activation, `navigator.storage.estimate()` is checked; if total origin usage exceeds 50 MB the API cache is flushed automatically.
- **Install prompt:** `web/src/composables/pwaInstall.ts` captures `beforeinstallprompt` in `App.vue` on mount. Settings page exposes an Install section (hidden when already in standalone mode).

## verify-birds Workflow

When asked to run `pnpm verify-birds` for any range:

1. Run the script and let it complete.
2. Parse the output log (`DataCollector/logs/verify-<ts>.json`) — filter for `matchMethod === "failed"`.
3. For each failed bird, look it up in `DataCollector/ebird.csv` (grep by partial scientific name or common name) to find the current eBird accepted name.
4. Update `DataCollector/retry.json` (array of objects) using a `node -e` one-liner — never use the Edit tool on JSON files. Each entry shape:
   ```json
   {
     "serialNumber": 54,
     "dbName": "Grey Francolin",
     "dbScientificName": "Francolinus pondicerianus",
     "correctScientificName": "Ortygornis pondicerianus",
     "notes": "..."
   }
   ```
   To add entries: read the file, parse, push new objects, `JSON.stringify` back and write. To remove a resolved entry: filter by `serialNumber`, write back.
5. Report a summary to the user: counts of matched/failed, list of failures with the eBird-correct scientific name and what changed, and any notable auto-corrections (commonName fallback matches).
6. Do NOT re-run the script automatically — wait for the user to fix the DB entries for failed birds first.

## Git Rules

- NEVER push to remote without explicit user approval. Commit locally and wait for review.
- Always show a summary of changes and ask before running `git push`.

## Design Reference

`DESIGN.md` at the project root is the canonical design critique and token rationale document. It covers: the elevation system rationale, dark mode contrast fixes, typography weight floors, component-level before/after decisions, and the share card design philosophy. Read it before making design decisions.

## Lint Rules

ESLint with `@eslint/js` recommended rules. Max line length: 120 chars. `prefer-const` and `no-var` enforced. `no-unused-vars` allows `_`-prefixed args.

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
