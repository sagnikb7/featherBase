# FeatherBase

A Pokédex-style database and visual explorer of Indian bird species. Express 5 API backed by MongoDB, with a Vue 3 frontend — deployed on [Netlify](https://featherbase.netlify.app).

Currently tracks **510 species** across 51 batch files, with data sourced from Wikipedia and LLM-assisted generation.

---

## Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
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
cp run.template.sh run.dev.sh
```

Edit `run.dev.sh` with your `MONGO_DB` connection string. This file is gitignored.

| Variable | Purpose | Default |
|----------|---------|---------|
| `PORT` | Server port | `8888` |
| `MONGO_DB` | MongoDB connection string | — |
| `DEBUG` | Verbose error stacks in responses | `false` |
| `VITE_IMG_DELIVERY_MODE` | `online` (Cornell CDN) or `offline` (local `/public/images/birds`) | `online` |

### 3. Run

```bash
# Full stack (builds frontend + starts API with nodemon)
./run.dev.sh

# API only (requires env vars already exported)
pnpm start:local

# Frontend dev server only (hot reload, proxies API to localhost:8888)
cd web && pnpm dev
```

---

## Repository Structure

```
featherBase/
├── index.js                 # Entry point — creates HTTP server, connects to MongoDB
├── netlify.toml             # Netlify build config + API redirects
├── netlify/functions/
│   └── api.mjs              # Serverless function wrapping Express via serverless-http
├── run.template.sh          # Environment template (copy to run.dev.sh)
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
│       └── insert-birds.js   # Bulk insert from data/birds/ into MongoDB
│
├── data/birds/              # Bird data (51 batch JSON files, 10 birds each)
│
├── DataCollector/           # Data collection (Python scrapers)
│
├── web/                     # ── Frontend (Vue 3 + Vite) ──
│   ├── src/
│   │   ├── App.vue           # Root: header + router-view with page transitions + bottom nav
│   │   ├── pages/
│   │   │   ├── index.vue     # Home: compact Pokédex list + API-powered search dropdown
│   │   │   ├── bird/[id].vue # Detail: image carousel, IUCN chip, habitat/diet tags
│   │   │   └── [...all].vue  # 404 catch-all
│   │   ├── components/
│   │   │   ├── BirdImage.vue  # Image with color-gradient loading placeholder
│   │   │   ├── TheHeader.vue  # Sticky nav with dark mode toggle
│   │   │   └── BottomNav.vue  # iOS-style bottom bar (mobile only)
│   │   ├── composables/
│   │   │   ├── index.ts       # Re-exports + baseUrl
│   │   │   ├── dark.ts        # Dark mode toggle
│   │   │   ├── iucn.ts        # IUCN status → colored chip + explanation
│   │   │   └── groupColor.ts  # Deterministic color hashing for bird groups
│   │   ├── styles/            # "The Digital Curator" design system
│   │   │   ├── main.css       # Import hub
│   │   │   ├── tokens.css     # Design tokens, dark mode, paper grain texture
│   │   │   ├── base.css       # Reset, app shell, header, bottom nav, transitions
│   │   │   └── components/    # search.css, status.css, bird-detail.css
│   │   └── types/common.ts    # Bird, Meta, Image, IUCNStatus types
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

The `search` param (min 3 chars) does case-insensitive matching on `name` and `scientificName`. All filter inputs are regex-escaped to prevent injection.

---

## Frontend Features

- **Pokédex list** — compact rows with serial number, name, scientific name, and color-coded group tags (no images on list page for fast mobile loading)
- **API-powered search** — debounced 300ms, shows dropdown with up to 8 results as you type
- **Image carousel** — swipe through all images of a species, with dot indicators and tag labels (adult, juvenile, male, etc.)
- **IUCN status chips** — colored dot + code + label (LC through EX), pulse animation on critical statuses
- **Group color hashing** — deterministic djb2 hash maps each group name to a 10-color earthy palette, consistent across list and detail views
- **Page transitions** — fade + drift animation via Vue `<Transition>`, respects `prefers-reduced-motion`
- **Mobile-first** — iOS-style bottom nav, organic card overlap on detail page, safe area support
- **Dark mode** — comprehensive token-based theming, toggleable from header or bottom nav

---

## Deployment

Deployed on **Netlify**:
- **Frontend**: static site from `web/dist/` served via CDN
- **Backend**: serverless function at `netlify/functions/api.mjs` wrapping Express via `serverless-http`
- **Redirects**: `/v1.0/*` and `/_health` are proxied to the function; all other routes fall through to `index.html` for client-side routing
- `src/app.js` skips static file serving when `process.env.NETLIFY` is set

For local development, the Express server serves both API and static files from the same origin.

---

## Data Pipeline

1. **Extract bird names** — Python scrapers in `DataCollector/` pull from Wikipedia and dibird.com
2. **Generate bird data** — Feed batches of 10 names to an LLM with a structured prompt, save as `data/birds/<n>.json`
3. **Insert into MongoDB** — `src/scripts/insert-birds.js` transforms fields, deduplicates by scientific name, and bulk-inserts with sequential serial numbers
