# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FeatherBase is a database/API of Indian bird species. It's an Express 5 + MongoDB backend that also serves a built frontend (Solid.js in `web/`). Deployed on Render.

## Commands

- **Run locally:** `pnpm start:local` (uses nodemon for auto-reload)
- **Run production:** `pnpm start`
- **Lint & fix:** `pnpm lint:fix` (ESLint with airbnb-base, also runs as pre-commit hook via Husky)
- **Build frontend:** `pnpm build:FE` (runs pnpm install + build inside `web/`)

There are no tests configured.

## Environment Variables

Configured via `convict` in `src/config.js`. Key vars: `PORT` (default 8000), `NODE_ENV`, `MONGO_DB` (connection string), `SENTRY_DSN`, `AES_KEY`, `AES_IV`.

## Architecture

- **ES Modules** throughout (`"type": "module"` in package.json)
- **Path aliases** via Node.js subpath imports: `#config`, `#logger`, `#models/*`, `#services/*`, `#controllers/*`, `#middlewares/*`, `#routes/*`, `#utils/*`, `#validators/*`
- **Layered architecture:** Routes (`src/routes/`) -> Joi validation middleware (`src/middlewares/apiValidator.js`) -> Controllers (`src/controllers/`) -> Services (`src/services/`) -> Models (`src/models/`)
- **BaseRepository pattern:** `src/models/baseRepository.js` wraps Mongoose with `get()`, `getOne()`, `create()`. Individual models (e.g., `birdBasicModel.js`, `metaModel.js`) extend it.
- **API base path:** `/v1.0/birds` - routes defined in `src/routes/birdRouter.js`
- **Frontend:** Solid.js app in `web/`, built output served as static files from `web/dist/`
- **Middleware chain** (in order): Sentry, timeout (30s), Helmet (with CSP), body parsers, request logger, routes, error handler
- **Data pipeline:** Bird data is generated via LLM prompts (see README), stored as JSON in `data/birds/`, and bulk-inserted via `src/scripts/insert-birds.js`

## Lint Rules

ESLint with airbnb-base. Max line length: 120 chars. `import/no-unresolved` and `import/extensions` are disabled (needed for subpath imports).
