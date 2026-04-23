# FeatherBase

A Pokédex-style database and visual explorer of Indian bird species. Express 5 API backed by MongoDB, with a Vue 3 frontend — deployed on [Netlify](https://featherbase.netlify.app).

Currently tracks **510 species** across 51 batch files, with data sourced from Wikipedia and LLM-assisted generation.

---

## Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 22+ |
| pnpm | 9+ |
| MongoDB | Atlas or local instance |
| Python 3 | Only needed for data collection scripts |

### 1. Install dependencies

```bash
# Backend
pnpm install

# Frontend
cd web && pnpm install
```

### 2. Configure environment

Copy the template and fill in your values:

```bash
cp .env.template .env
```

Edit `.env` with your `MONGO_DB` connection string. This file is gitignored. Environment variables are loaded via Node's native `--env-file` flag — no dotenv package required.

| Variable | Purpose | Default |
|----------|---------|---------|
| `PORT` | Server port | `8888` |
| `MONGO_DB` | MongoDB connection string | — |
| `ADMIN_TOKEN` | Bearer token for admin write endpoints | — |
| `DEBUG` | Sets log level to `debug` and includes error stacks in API error responses | `false` |
| `VITE_IMG_DELIVERY_MODE` | `online` (GitHub Pages CDN) or `offline` (local `/public/images/birds`) | `online` |

### 3. Run

```bash
# Backend + frontend together
pnpm dev

# Backend only (Node --watch, reads .env)
pnpm dev:BE

# Frontend only (Vite, hot reload, proxies API to localhost:8888)
pnpm dev:FE
```

---

## Repository Structure

```
featherBase/
├── index.js                 # Entry point — creates HTTP server, connects to MongoDB
├── netlify.toml             # Netlify build config + API redirects
├── netlify/functions/
│   └── api.mjs              # Serverless function wrapping Express via serverless-http
├── .env.template            # Environment template (copy to .env)
├── package.json             # Backend deps + scripts, subpath import aliases
│
├── src/                     # ── Backend ──
│   ├── app.js               # Express app: middleware chain → routes → error handler
│   ├── config.js             # Convict config schema (env vars, validation)
│   ├── routes/
│   │   ├── index.js          # Mounts all route groups onto the app
│   │   └── birdRouter.js     # GET /v1.0/birds, GET /v1.0/birds/groups, GET /v1.0/birds/:id
│   ├── controllers/          # Request handlers
│   ├── services/             # Business logic (query models, join data, caching)
│   ├── models/
│   │   ├── baseRepository.js # Generic Mongoose wrapper: get(), getOne(), create(), count(), distinct()
│   │   ├── birdBasicModel.js # Bird schema + BirdModel class
│   │   └── metaModel.js      # Image metadata schema
│   ├── validators/           # Joi schemas for request validation
│   ├── middlewares/
│   │   ├── basic.js          # Helmet (CSP), timeout, body parsers
│   │   ├── requestLogger.js  # Structured JSON request/response logging
│   │   ├── apiValidator.js   # Generic Joi validation middleware
│   │   └── errorHandler.js   # 404 + global error handler
│   ├── constants/            # API status codes, error messages
│   ├── utils/                # Logger (Winston), MD5 hashing, Mongo connection
│   └── scripts/
│       ├── insert-birds.js        # Bulk insert from data/birds/ into MongoDB
│       ├── upsert-birds-v2.js     # Upsert enriched v2 data from data/birdsV2/ (idempotent)
│       ├── migrate-best-seen-at.js # One-shot: convert bestSeenAt string → [String] array
│       └── verify-birds.js        # Cross-reference DB records against eBird CSV
│
├── data/birds/              # Original bird data (batch JSON files, 10 birds each)
├── data/birdsV2/            # Enriched v2 bird data — additional fields per bird
│
├── DataCollector/           # Data collection (Python scrapers)
│
├── web/                     # ── Frontend (Vue 3 + Vite) ──
│   ├── src/
│   │   ├── App.vue           # Root: header + router-view with page transitions + bottom nav
│   │   ├── pages/
│   │   │   ├── index.vue       # Home: compact Pokédex list + API-powered search dropdown
│   │   │   ├── bird/[id].vue   # Detail: image carousel, IUCN chip, habitat/diet tags
│   │   │   ├── test-cards.vue  # Dev tool: generate reference cards for all 5 rarity tiers
│   │   │   └── [...all].vue    # 404 catch-all
│   │   ├── components/
│   │   │   ├── BirdImage.vue     # Image with color-gradient loading placeholder
│   │   │   └── BottomNav.vue     # iOS-style bottom nav (Birds + Settings)
│   │   ├── composables/
│   │   │   ├── index.ts          # Re-exports + baseUrl
│   │   │   ├── settings.ts       # Theme system (light/dark/auto/midnight) + localStorage persistence
│   │   │   ├── iucn.ts           # IUCN status → colored chip + explanation
│   │   │   ├── groupColor.ts     # Deterministic djb2 hash → 10-color earthy palette per group
│   │   │   ├── rarity.ts         # 5-tier rarity metadata (label, color, glow)
│   │   │   ├── shareCard.ts      # Canvas-based trading card generator (630×880 @ 2×)
│   │   │   ├── botd.ts           # saveBotdSerial / isBotd via sessionStorage
│   │   │   ├── format.ts         # formatSerial() — 4-digit zero-padded (#0042)
│   │   │   ├── confetti.ts       # fireUnlockConfetti() — midnight theme unlock effect
│   │   │   ├── pwaInstall.ts     # beforeinstallprompt capture + install trigger
│   │   │   └── networkStatus.ts  # useNetworkStatus() — SW-driven offline banner
│   │   ├── styles/               # "The Digital Curator" design system
│   │   │   ├── main.css          # Import hub
│   │   │   ├── tokens.css        # Design tokens — colors, shadows, typography, grain texture
│   │   │   ├── base.css          # Reset, app shell, bottom nav, offline banner, transitions
│   │   │   └── components/       # search.css, status.css, bird-detail.css, settings.css
│   │   └── types/common.ts       # Bird, Meta, Image, IUCNStatus types
│   └── vite.config.ts
│
└── public/                  # Static assets (bird images gitignored)
```

---

## API Endpoints

| Method | Path | Query Params | Description |
|--------|------|-------------|-------------|
| `GET` | `/_health` | — | Health check |
| `GET` | `/v1.0/birds` | `page`, `size`, `search`, `group`, `family`, `order` | List birds (paginated, searchable) |
| `GET` | `/v1.0/birds/groups` | — | All bird group names (cached 1h) |
| `GET` | `/v1.0/birds/:id` | — | Full bird details + image metadata |

### Search behaviour

| Input type | Rule | Example |
|---|---|---|
| Plain integer | Exact `serialNumber` match only — no text conditions | `?search=5` → bird #5 |
| Text (≥ 3 chars) | Word-boundary prefix regex on `name` and `scientificName`, plus taxonomic prefix resolution (see below) | `?search=owl` |

**Word-boundary prefix** (`\b<query>`, case-insensitive): matches any position where a word *starts with* the query. `owl` matches "Barn **Owl**", "**Owlet**", "ako-**owl**" but not "Surf**owl**" (no word boundary before it). For `scientificName` the same rule covers both genus and species, so `axi` matches "**Axi**s baku" and "Baku **axi**s" but not "Per**axi**s baku".

**Taxonomic prefix resolution**: on startup the backend caches all distinct `order`, `family`, and `commonGroup` values (1h TTL, same NodeCache used for groups). When a text search arrives, the query is prefix-matched against each list (case-insensitive). Matches are expanded into exact `$in` filter clauses and added to the `$or` alongside the name/scientificName regex. `Gall` → `{ order: { $in: ["Galliformes"] } }`. `rina` alone does not match `Andorina`. A query like `Gee` that hits "Geese" (group) and "Geezos" (family) adds both clauses, so birds from either category appear alongside any name/scientific matches.

`group`, `family`, and `order` query params are still supported as standalone exact-match filters (used by the group chip UI).

---

## Frontend Features

- **Pokédex list** — compact rows: name on the first line, `#0001 · Scientific name` on the second, group color chip on the right (desktop) or third line (mobile)
- **API-powered search** — debounced 300ms; triggers at 1 character for numeric queries, 3 characters for text. Dropdown results share the same row layout as the list
- **Image carousel** — swipe through all images of a species, with dot indicators and tag labels (adult, juvenile, male, etc.)
- **IUCN status chips** — colored dot + code + label (LC through EX), pulse animation on critical statuses
- **Group color hashing** — deterministic djb2 hash maps each group name to a 10-color earthy palette, consistent across list and detail views
- **Page transitions** — fade + drift animation via Vue `<Transition>`, respects `prefers-reduced-motion`
- **Mobile-first** — iOS-style bottom nav (Birds + Settings), organic card overlap on detail page, 44px minimum touch targets, safe area support
- **Theme system** — four themes: Light, Dark, Auto (system), and Midnight (deep violet, locked until user shares a bird card). Controlled from Settings page. No inline toggle.
- **Rarity system** — 5-tier rarity (Common → Legendary) with progressive visual treatment on detail page: colored badge, glow effects, and accent saturation scaling with tier
- **Bird of the Day** — home page features a daily bird card (seeded by date) with entrance slide-up animation, one-shot shimmer sweep, and a persistent accent glow in the bird's group color. Visiting that bird's detail page shows a "Bird of the Day" chip in the badge row. All animations respect `prefers-reduced-motion`
- **Trading card share** — "Share" on any bird's detail page generates a 630×880 (rendered at 2×) trading card via Canvas API. Each rarity tier has a distinct deeply-saturated dark background (near-black for Common, rich hues for higher tiers) with a hard cut between image and info panel. Accent color, serial pill, divider, and name progressively adopt the tier accent as rarity increases. When sharing the Bird of the Day, the card gets a gold "✦ TODAY" pill on the image and a "BIRD OF THE DAY · DATE" gold eyebrow above the name. Web Share API with PNG download fallback
- **PWA / installable** — ships a service worker with two caches (`featherbase-v3` for static assets, `featherbase-api-v3` for API responses). Settings → Install section lets users add the app to their home screen (one-tap on Android, guided instructions on iOS). Section auto-hides once installed.

### PWA Caching Strategy

| Route | Strategy | TTL |
|-------|----------|-----|
| Static assets (`/assets/*`) | Cache-first | permanent until cache bump |
| `GET /v1.0/birds/groups` | Stale-while-revalidate | 5 min |
| `GET /v1.0/birds/:id` | Stale-while-revalidate | 5 min |
| `GET /v1.0/birds?page=…` (list, no search) | Stale-while-revalidate | 5 min |
| `GET /v1.0/birds?search=…` | Network-first | none (always fresh) |
| All other API calls | Network-first | none |

**Stale-while-revalidate** means: if a cached response is under 5 minutes old, return it immediately (zero network latency). If it's older, return the cached copy instantly and fetch a fresh copy in the background for the next request. This is why navigating to Settings and back does not re-hit the API — the home page calls are served from the `featherbase-api-v3` cache.

**50 MB hard limit**: on every SW activation, `navigator.storage.estimate()` is checked. If total origin storage exceeds 50 MB, the entire `featherbase-api-v3` cache is flushed automatically. Static assets in `featherbase-v3` are not affected. Users can also trigger a manual flush via **Settings → Clear Cache**, which deletes all Cache Storage entries and re-registers the SW fresh.

---

## Deployment

Deployed on **Netlify**:
- **Frontend**: static site from `web/dist/` served via CDN
- **Backend**: serverless function at `netlify/functions/api.mjs` wrapping Express via `serverless-http`
- **Redirects**: `/v1.0/*` and `/_health` are proxied to the function; all other routes fall through to `index.html` for client-side routing
- `src/app.js` skips static file serving when `process.env.NETLIFY` is set

For local development, the Express server serves both API and static files from the same origin.

Alternatively, deploy on **Render** using `render.yaml` at the project root — single web service, Node 22, `singapore` region, auto-deploy on commit. Set the `MONGO_DB` secret in the Render dashboard.

---

## Data Pipeline

### Original pipeline (v1 data)

1. **Extract bird names** — Python scrapers in `DataCollector/` pull from Wikipedia and dibird.com
2. **Generate bird data** — Feed batches of 10 names to an LLM using the prompt in [`DataCollector/prompt.txt`](DataCollector/prompt.txt), save as `data/birds/<n>.json`
3. **Insert into MongoDB** — transforms fields, deduplicates by scientific name, and bulk-inserts with sequential serial numbers

```bash
pnpm insert-birds "56-60"        # insert batch files 56.json through 60.json
pnpm insert-birds "[56,58,60]"   # insert specific batch files
```

4. **Verify against eBird** — cross-references DB records against `DataCollector/ebird.csv`, corrects `scientificName`, `order`, `family`, `commonGroup`, sets `speciesCode`, and writes a `verification` field per record. Logs written to `DataCollector/logs/verify-<ts>.json`.

```bash
pnpm verify-birds "1-10"         # verify serial numbers 1 through 10
pnpm verify-birds "[23,56,67]"   # verify specific serial numbers
```

### Enrichment pipeline (v2 data)

Birds are progressively enriched with additional fields via a separate v2 JSON format and upsert script. v2 adds: `lengthCm`, `weightG` (min/max), `wingspanCm` (min/max), `callDescription`, `juvenileDescription`, `similarSpecies`, `seasonalityInIndia`, `version`.

```bash
node --env-file=.env src/scripts/upsert-birds-v2.js "42"     # upsert batch 42 (serials 411–420)
node --env-file=.env src/scripts/upsert-birds-v2.js "41-45"  # upsert range of batches
node --env-file=.env src/scripts/upsert-birds-v2.js "[41,43]" # upsert specific batches
```

The script is idempotent — safe to re-run. It looks up each bird by `scientificName` first, then falls back to the expected serial number. Fields in `SKIP_ON_UPDATE` (taxonomic and eBird-verified fields) are never overwritten. Every run writes a structured log to `DataCollector/logs/upsert-v2-<ts>.json`. Birds without v2 data continue to work normally in the UI — all new fields are optional and conditionally rendered.

> **Note on data origin:** All bird data in this database is **AI-generated** using the prompt in `DataCollector/prompt.txt` — it is not scraped or copied from any third-party source. Because it is LLM-generated, some fields (IUCN status, distribution, sighting hotspots) may contain inaccuracies. Always cross-check critical data against authoritative sources such as the IUCN Red List or eBird.
