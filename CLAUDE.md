# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FeatherBase is a Pokédex-style database of Indian bird species. Each bird has a serial number (#001, #002, etc.) and detailed field data. Express 5 + MongoDB backend with a Vue 3 frontend in `web/`. Deployed on Netlify (frontend as static site, backend as serverless function).

## Commands

- **Run locally:** `pnpm start:local` (uses nodemon for auto-reload)
- **Run production:** `pnpm start`
- **Lint & fix:** `pnpm lint:fix` (ESLint with airbnb-base, also runs as pre-commit hook via Husky)
- **Build frontend:** `pnpm build:FE` (runs pnpm install + build inside `web/`)

There are no tests configured.

## Environment Variables

Configured via `convict` in `src/config.js`. Key vars: `PORT` (default 8888), `NODE_ENV`, `MONGO_DB` (connection string), `MODE` (server), `DEBUG`, `SERVICE_NAME`.

## Architecture

- **ES Modules** throughout (`"type": "module"` in package.json)
- **Path aliases** via Node.js subpath imports: `#config`, `#logger`, `#models/*`, `#services/*`, `#controllers/*`, `#middlewares/*`, `#routes/*`, `#utils/*`, `#validators/*`
- **Layered architecture:** Routes (`src/routes/`) -> Joi validation middleware (`src/middlewares/apiValidator.js`) -> Controllers (`src/controllers/`) -> Services (`src/services/`) -> Models (`src/models/`)
- **BaseRepository pattern:** `src/models/baseRepository.js` wraps Mongoose with `get()`, `getOne()`, `create()`. Individual models (e.g., `birdBasicModel.js`, `metaModel.js`) extend it.
- **API base path:** `/v1.0/birds` - routes defined in `src/routes/birdRouter.js`
- **API search:** `GET /v1.0/birds?search=<term>` does case-insensitive regex on `name` and `scientificName`. The list endpoint returns `{ id, serialNumber, name, scientificName, commonGroup }` — no images (meta join skipped for performance).
- **Frontend:** Vue 3 + Vite + UnoCSS app in `web/`, built output served as static files from `web/dist/`. Uses file-based routing (unplugin-vue-router), auto-imports (unplugin-auto-import), and Phosphor icons (@iconify-json/ph).
- **Middleware chain** (in order): timeout (30s), Helmet (CSP whitelists Cornell CDN), body parsers, request logger, routes, 404 handler, error handler. Sentry was removed — re-add when needed.
- **Data pipeline:** Bird data is generated via LLM prompts (see README), stored as JSON in `data/birds/`, and bulk-inserted via `src/scripts/insert-birds.js`
- **Image delivery:** Dual mode via `VITE_IMG_DELIVERY_MODE` — `online` uses Cornell CDN URLs from MongoDB meta collection, `offline` serves from `public/images/birds/` (gitignored). Images are only loaded on the detail page, not the list.

## Deployment (Netlify)

- `netlify.toml` at project root configures the build
- Frontend: static site from `web/dist/`
- Backend: serverless function at `netlify/functions/api.mjs` wraps Express via `serverless-http`
- Redirects proxy `/v1.0/*` and `/_health` to the function
- `src/app.js` skips static file serving when `process.env.NETLIFY` is set

## Frontend Design System

"The Digital Curator" — deep forest & earth tones with paper grain texture.

- **Tokens:** `web/src/styles/tokens.css` — all colors, typography, spacing, shadows, transitions, grain texture
- **Fonts:** Manrope (sans), Newsreader (serif/display), DM Mono (mono)
- **Components use CSS custom properties, not utility classes** for colors/spacing. UnoCSS is used for icons (`i-ph-*`) and some layout utilities in templates.
- **Mobile-first:** bottom navigation bar (iOS-style) visible below 640px, sticky header. Mobile detail page has organic overlap (intro panel slides over image with rounded top corners).
- **Page transitions:** Vue `<Transition>` with fade + drift, respects `prefers-reduced-motion`
- **IUCN status chips:** colored dot + code + label, pulse animation on critical statuses
- **Group color hashing:** `web/src/composables/groupColor.ts` — deterministic djb2 hash maps `commonGroup` names to a 10-color earthy palette. Same color on list and detail pages.
- **Home page:** compact Pokédex-style rows (no images), API-powered search with debounced dropdown (300ms, 3+ chars), group filter
- **Detail page:** image carousel with swipe support, dot indicators, image tags (adult/juvenile/male/female — "default" tag hidden). Prev/next bird navigation is in the intro panel, not on the image.
- **Panel backgrounds:** accent-tinted (3.5% forest green in light, 4% mint in dark) with accent-derived top border — branded surface, not generic gray.

## PWA

The app is installable as a Progressive Web App:
- `web/public/manifest.json` — app manifest with name, theme color, icons
- `web/public/sw.js` — service worker with cache-first for static assets, network-first for API calls
- `web/public/favicon.svg` — feather logo (adapts to dark mode via `prefers-color-scheme`)
- `web/public/logo.svg` — maskable icon (forest green background, mint feather)
- Cache name: `featherbase-v1` — bump the version to invalidate on deploy

## Lint Rules

ESLint with airbnb-base. Max line length: 120 chars. `import/no-unresolved` and `import/extensions` are disabled (needed for subpath imports).

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
