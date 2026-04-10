# FeatherBase

A database and visual explorer of Indian bird species. Express 5 API backed by MongoDB, with a Vue 3 frontend — deployed on [Render](https://featherbase.onrender.com).

Currently tracks **510 species** across 51 batch files, with data sourced from Wikipedia and LLM-assisted generation.

---

## Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
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

Edit `run.dev.sh` with your `MONGO_DB` connection string and other secrets. This file is gitignored.

| Variable | Purpose | Default |
|----------|---------|---------|
| `PORT` | Server port | `8888` |
| `MONGO_DB` | MongoDB connection string | — |
| `DEBUG` | Verbose error stacks in responses | `false` |
| `SENTRY_DSN` | Sentry error tracking | — |
| `AES_KEY` / `AES_IV` | Encryption keys | — |
| `VITE_IMG_DELIVERY_MODE` | `online` (Cornell CDN) or `offline` (local `/public/images/birds`) | `online` |

### 3. Run

```bash
# Full stack (builds frontend + starts API with nodemon)
./run.dev.sh

# API only (requires env vars already exported)
pnpm start:local

# Frontend dev server only (hot reload on port 8000)
cd web && pnpm dev
```

The API serves the built frontend from `web/dist/` as static files, so for production-like testing you need `./run.dev.sh` or run `pnpm build:FE` first.

---

## Repository Structure

```
featherBase/
├── index.js                 # Entry point — creates HTTP server, connects to MongoDB
├── run.template.sh          # Environment template (copy to run.dev.sh)
├── package.json             # Backend deps + scripts, subpath import aliases
│
├── src/                     # ── Backend ──
│   ├── app.js               # Express app setup: middleware chain → routes → static files → error handler
│   ├── config.js             # Convict config schema (env vars, validation)
│   ├── routes/
│   │   ├── index.js          # Mounts all route groups onto the app
│   │   └── birdRouter.js     # GET /v1.0/birds, GET /v1.0/birds/:id
│   ├── controllers/          # Request handlers (parse params, call service, send response)
│   ├── services/             # Business logic (query models, join data)
│   ├── models/
│   │   ├── baseRepository.js # Generic Mongoose wrapper: get(), getOne(), create()
│   │   ├── birdBasicModel.js # Bird schema + BirdModel class
│   │   └── metaModel.js      # Image metadata schema
│   ├── validators/           # Joi schemas for request validation
│   ├── middlewares/
│   │   ├── basic.js          # Helmet (CSP), timeout, body parsers
│   │   ├── requestLogger.js  # Structured JSON request/response logging with nanoid
│   │   ├── apiValidator.js   # Generic Joi validation middleware (body/query/params)
│   │   └── errorHandler.js   # 404 + global error handler (Sentry-ready)
│   ├── constants/            # HTTP status codes, error messages
│   ├── utils/                # Logger (Winston), chalk helpers, MD5 hashing, Mongo connection
│   └── scripts/
│       └── insert-birds.js   # Bulk insert from data/birds/ files into MongoDB
│
├── data/birds/                 # ── Bird Data ── (51 batch files, 10 birds each)
│   ├── 1.json … 51.json
│
├── DataCollector/            # ── Data Collection (Python) ──
│   ├── getBatch.py           # Prints bird names in numbered batches of 10
│   ├── name_extract.py       # Scrapers: Wikipedia table + dibird.com HTML
│   ├── StateIndiaBirds.xlsx  # Original bird checklist spreadsheet
│   ├── output_wikipedia.csv  # Extracted bird names from Wikipedia
│   ├── output_dbird.csv      # Extracted bird names from dibird.com
│   ├── colors.json           # Color reference data
│   └── requirements.txt      # Python deps (pandas, beautifulsoup4)
│
├── web/                      # ── Frontend (Vue 3 + Vite) ──
│   ├── src/
│   │   ├── main.ts           # App bootstrap: Vue + router + UnoCSS + styles
│   │   ├── App.vue           # Root component: header + router-view
│   │   ├── pages/            # File-based routing (unplugin-vue-router)
│   │   │   ├── index.vue     # Home: search bar + bird card grid
│   │   │   ├── bird/[id].vue # Bird detail: image, IUCN badge, taxonomy info
│   │   │   ├── bird/index.vue# /bird → redirects to random bird
│   │   │   └── [...all].vue  # 404 catch-all
│   │   ├── components/
│   │   │   ├── BirdCard.vue  # Card component used in the grid
│   │   │   └── TheHeader.vue # Nav bar with dark mode toggle
│   │   ├── composables/
│   │   │   ├── index.ts      # Re-exports + baseUrl logic (dev vs prod)
│   │   │   ├── dark.ts       # Dark mode toggle via @vueuse/core
│   │   │   └── iucn.ts       # IUCN status → color classes + explanations
│   │   ├── styles/           # Design system (all CSS lives here)
│   │   │   ├── main.css      # Import hub: tokens → base → components
│   │   │   ├── tokens.css    # Design tokens: colors, spacing, radii, shadows
│   │   │   ├── base.css      # Font-face declarations, HTML reset
│   │   │   └── components/   # Per-component stylesheets
│   │   │       ├── card.css
│   │   │       ├── search.css
│   │   │       ├── status.css
│   │   │       └── bird-detail.css
│   │   └── types/
│   │       └── common.ts     # Bird, SingleBirdResponse, Meta, Image interfaces
│   ├── uno.config.ts         # UnoCSS: shortcuts (btn, icon-btn), fonts, icons
│   └── vite.config.ts        # Vite: auto-imports, component resolution, vue-router
│
└── public/                   # Static assets served at /
```

---

## Backend Architecture

### Request Lifecycle

```
Client Request
  → Helmet (security headers, CSP)
  → Timeout (30s)
  → Body Parsers (JSON, URL-encoded)
  → Request Logger (structured JSON, nanoid-tagged)
  → Router
      → Joi Validation Middleware
      → Controller
          → Service (business logic)
              → Model (BaseRepository → Mongoose)
  → Error Handler (404 / 500, Sentry-ready)
```

### Path Aliases

The backend uses Node.js [subpath imports](https://nodejs.org/api/packages.html#subpath-imports) defined in `package.json`. These let you write `import config from '#config'` instead of relative paths. IDE support is provided by matching entries in `jsconfig.json`.

| Alias | Maps to |
|-------|---------|
| `#config` | `./src/config.js` |
| `#logger` | `./src/utils/logger.js` |
| `#models/*` | `./src/models/*` |
| `#services/*` | `./src/services/*` |
| `#controllers/*` | `./src/controllers/*` |
| `#middlewares/*` | `./src/middlewares/*` |
| `#routes/*` | `./src/routes/*` |
| `#utils/*` | `./src/utils/*` |
| `#validators/*` | `./src/validators/*` |
| `#constants/*` | `./src/constants/*` |

### BaseRepository Pattern

All models extend `BaseRepository` (`src/models/baseRepository.js`), which wraps Mongoose with three methods:

- `get(query, sort?, projection?)` — find many, with optional sort and field selection
- `getOne(query)` — find one document
- `create(newObj)` — insert a new document

Models define their Mongoose schema and pass the compiled model to `super()`. See `birdBasicModel.js` for the full bird schema.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/_health` | Health check |
| `GET` | `/v1.0/birds` | List all birds (id, name, scientificName, thumbnail) |
| `GET` | `/v1.0/birds/:id` | Full bird details + image metadata |

---

## Frontend Architecture

### Tech Stack

- **Vue 3** with `<script setup>` composition API
- **Vite** for dev server and builds
- **UnoCSS** (Tailwind-like utility classes + attributify mode + icon presets)
- **unplugin-vue-router** — file-based routing from `src/pages/`
- **unplugin-auto-import** — auto-imports Vue/VueUse/router APIs (no manual imports needed for `ref`, `computed`, `useRoute`, etc.)
- **Fuse.js** — client-side fuzzy search on the bird list
- **@vueuse/core** — dark mode toggle, utilities

### Design System

All CSS lives in `web/src/styles/` and is imported through `main.css`. The components themselves contain no `<style>` blocks.

- **`tokens.css`** — Design tokens (CSS custom properties) for colors, spacing, radii, shadows, transitions. Light and dark themes are defined here. To experiment with a new look, duplicate this file and change the values.
- **`base.css`** — Font-face declarations and HTML reset.
- **`components/*.css`** — One file per component/feature: `card.css`, `search.css`, `status.css`, `bird-detail.css`.

Dark mode works automatically — tokens are reassigned under `.dark` in `tokens.css`, so component styles use the same variable names and adapt without any `.dark` overrides.

### Image Delivery

Controlled by `VITE_IMG_DELIVERY_MODE`:
- **`online`** — Images loaded from Cornell Lab's CDN (`cdn.download.ams.birds.cornell.edu`)
- **`offline`** — Images served from `/public/images/birds/` (not committed, gitignored)

---

## Data Pipeline

The data pipeline has three stages:

### 1. Extract bird names (Python)

```bash
cd DataCollector
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

`name_extract.py` has two scrapers:
- `wikiExtract()` — scrapes the Wikipedia [List of birds of India](https://en.wikipedia.org/wiki/List_of_birds_of_India) table for common + scientific names
- `dibird_extract()` — parses a local `bird.html` file from dibird.com

Output CSVs: `output_wikipedia.csv`, `output_dbird.csv`

### 2. Generate bird data (LLM)

Run `getBatch.py` to print bird names in batches of 10:

```bash
python3 getBatch.py
```

Copy a batch of names into an LLM prompt (the full prompt template is in the project — it asks for structured JSON with IUCN status, habitat, identification tips, colors, size, diet, etc.). Save the output as `data/birds/<batch_number>.json`.

Each JSON file contains an array of 10 bird objects. Currently there are 51 files (510 birds).

### 3. Insert into MongoDB

In `src/scripts/insert-birds.js`, set `START_FILE` and `END_FILE` to the batch range you want to insert, then uncomment the `insertBirds()` call in `src/routes/index.js` and hit the server. The script:

1. Reads each `data/birds/<n>.json` file
2. Transforms field names (e.g., `IUCN_status` → `iucnStatus`, parses arrays from comma-separated strings)
3. Generates an MD5 hash from the scientific name
4. Checks for duplicates before inserting
5. Assigns sequential `serialNumber` based on batch and position

---

## Development Commands

### Backend

| Command | Description |
|---------|-------------|
| `./run.dev.sh` | Full stack: build frontend + start API with nodemon |
| `pnpm start:local` | API only with nodemon (env vars must be exported) |
| `pnpm start` | Production start |
| `pnpm lint:fix` | ESLint with airbnb-base (auto-fixes) |

### Frontend

| Command | Description |
|---------|-------------|
| `cd web && pnpm dev` | Vite dev server (port 8000, hot reload) |
| `pnpm build:FE` | Build frontend (runs from repo root) |
| `cd web && pnpm lint` | ESLint for frontend |
| `cd web && pnpm typecheck` | TypeScript type checking |
| `cd web && pnpm test` | Run Vitest |

### Linting

- **Backend**: ESLint with `airbnb-base`. Max line length 120. Runs automatically on pre-commit via Husky.
- **Frontend**: ESLint with `@antfu/eslint-config`. Runs on pre-commit via `simple-git-hooks` + `lint-staged`.

---

## Deployment

Deployed on Render. The server builds the frontend (`pnpm build:FE`), then serves `web/dist/` as static files alongside the API. All routes that don't match an API endpoint or static file fall through to `index.html` for client-side routing.

**Live URL:** https://featherbase.onrender.com/v1.0/birds/50
