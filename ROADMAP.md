# FeatherBase — Product Roadmap

> A living document. Features are organized by phase, not by date — shipping pace determines the timeline. Each phase has a theme, a north-star metric it moves, and honest effort estimates. Items marked **✦** are out-of-the-box ideas.

---

## Product Vision

FeatherBase is the Pokédex for Indian birdwatchers — a curated dossier of every species, built for people who want to *know* birds, not just tick them off a list. The ideal user comes back daily, deepens their knowledge with every visit, and occasionally sends a share card to a friend who didn't know they cared about birds.

**Three things this product must always be:**
1. **Fast and beautiful** — zero friction to the information, premium feel
2. **Educational without being academic** — field data presented as discovery, not textbook
3. **Quietly addictive** — reasons to return that don't feel manipulative

---

## North Star Metrics

| Metric | Why It Matters |
|---|---|
| **7-day retention** | Are people returning after the first visit? |
| **Birds viewed per session** | Are people exploring or bouncing at one bird? |
| **Share card sends** | Viral coefficient — new users from existing ones |
| **Collection completion rate** | Do users feel progress? Does the catalog feel finishable? |

---

## Current State Audit

**What's working well:**
- Browse + search + group filter — core loop is solid
- Share card — strong differentiation, rarity tiers look great
- Bird of the Day — creates a daily return habit seed
- Midnight theme unlock via sharing — clever retention + viral loop
- PWA installable — reduces friction for returning users

**Gaps that block growth:**
- No personal layer — nothing remembers you between visits (beyond theme)
- Filter surface is shallow — can't filter by rarity, IUCN status, habitat, migration
- Rich schema fields still unused in the UI — `order`, `family`, `weightG`, `wingspanCm`, `callDescription`, `juvenileDescription`, `similarSpecies`, `seasonalityInIndia`, `speciesCode` (eBird link) — see Phase 0 detail page expansion
- No discovery path except search — if you don't know what you're looking for, you're stuck
- No sense of progress or completion

**Schema fields now live in the UI (April 2026):**
`bestSeenAt` (pills), `migrationStatus` (meta), `seasonalityInIndia` (meta), `habitat` (pills), `diet` (pills), `size` + `lengthCm` (size display), `weightG` (intro-meta), `wingspanCm` (intro-meta), `colors`, `identification`, `rarity`, `iucnStatus`, `commonGroup` (clickable filter pill)

---

## Phase 0 — Foundation
**Theme: Fix the floor before building the ceiling**
**Moves: Session depth, data trust**

These aren't features. They're the table stakes that make all subsequent work land properly.

| Item | Effort | Notes |
|---|---|---|
| Advanced filters — rarity tier, IUCN status, habitat, migration status | S | Backend data exists; UI chip strip like the group filter |
| Sort control — alphabetical, by rarity, by IUCN threat level | S | Query param on existing list endpoint |
| Bird count visible on home | XS | "500 species documented" in the hero tagline |
| Search by location — `Best_seen_at` field is searchable | S | Add to the regex search or separate endpoint |
| Taxonomy view — browse by Order/Family not just common group | M | Data exists, needs a new browse path/page |
| Fix empty-image states — placeholder that looks intentional, not broken | S | Currently a camera-slash icon — needs more intentional treatment |
| Detail page: "Related birds" section | M | Same Family or Group, simple aggregation query |
| Detail page: Link to `Best_seen_at` location in Maps | XS | One anchor tag with a Google Maps search URL |

### Detail Page — Next Data Layer (v2 schema fields, all in API now)

Full schema from `/v1.0/birds/:id` as of April 2026. Fields below are in the DB for v2 birds but not yet surfaced in the UI.

| Field | Sample value | Effort | Where it fits |
|---|---|---|---|
| `weightG` | `{ min: 715, max: 1015 }` | XS | Extend the existing size display: `MEDIUM · 48 cm · 715–1015 g` |
| `wingspanCm` | `{ min: 85, max: 95 }` | XS | Same — `wingspan 85–95 cm` alongside length |
| `seasonalityInIndia` | `"resident"` | XS | Add to the Habitat & Range panel next to `migrationStatus` |
| `order` + `family` | `"Anseriformes"` / `"Anatidae"` | XS | New taxonomy row in the intro panel — both tappable to a future taxonomy browse |
| `speciesCode` | `"fuwduc"` | XS | eBird external link: `ebird.org/species/<code>` — in the intro or about panel |
| `similarSpecies` | `["Lesser whistling duck"]` | S | New panel: "Often Confused With" — pills that link to the similar bird's detail page (requires name→ID lookup) |
| `callDescription` | `"A thin, clear two-note whistle 'kee-weeoo'"` | S | Field-guide quote in the Habitat & Range panel, below diet. One italic sentence. Previously reverted — needs isolated panel + mobile testing. |
| `juvenileDescription` | `"Duller than adults with…"` | S | Show conditionally in the image panel when a juvenile-tagged image exists. Contextually relevant, not always shown. |

**Priority order:** `weightG`/`wingspanCm`/`seasonalityInIndia` first (XS effort, no layout risk), then `order`/`family`/`speciesCode` (XS, high dossier value), then `similarSpecies` (S, needs backend name→ID lookup), then `callDescription` and `juvenileDescription` last (S, mobile layout risk).

**Constraint:** Never surface a new field without testing on a 375px mobile viewport. `callDescription` was reverted once already for this reason.

---

## Phase 1 — Discover
**Theme: Turn browsing into exploration**
**Moves: Session depth, birds viewed per session**

The catalog has 500+ birds. Right now a new user sees a list and searches. Exploration features turn this into a museum you wander through rather than a database you query.

| Item | Effort | Notes |
|---|---|---|
| **Color Explorer** — browse birds by their dominant color | M | `Primary_colors_of_the_bird` field; color swatch filter strip. Click "blue" and see all blue birds. |
| **Random Bird** — a "Surprise me" button | XS | Single endpoint `GET /v1.0/birds/random`. One of the highest-engagement patterns on a catalog. |
| **Seasonal Filter** — birds by migration status (resident / local / foreign) | S | `Migration_status` field already in schema |
| **Size Filter** — filter by small / medium / large | S | Parse from `Size_of_the_bird` field |
| **"Often confused with" disambiguation** — manually curated pairs | L | Requires data curation; shows on detail page as a side-by-side link. High educational value. |
| **✦ Chaos Bird** — a slot-machine reveal on the home page | M | Button that "spins" through serial numbers with animation before landing on a random bird. Addictive micro-interaction. |
| **✦ Color Palette of the Day** — home page shows today's bird's colors as an abstract swatch | S | Use the `Primary_colors_of_the_bird` data; pure visual delight. |
| **Hotspots page** — aggregate `Best_seen_at` into a location guide | M | Browse mode page listing top birdwatching locations and the species found there |
| **Bird call audio** — via Xeno-canto API | L | Free API; fetch by scientific name. Single biggest gap in a birding product. |

---

## Phase 2 — Collect
**Theme: Give the user a reason to come back with their name on it**
**Moves: 7-day retention, collection completion rate**

The collection layer is the single biggest retention mechanism available. No auth required — localStorage is fine for V1. The data lives on-device and the emotional hook (progress, completion) is real.

| Item | Effort | Notes |
|---|---|---|
| **"Mark as Seen" on detail page** | S | Single tap, stored in localStorage. No auth. Timestamp recorded. |
| **My Collection page** | M | Browse mode page. Shows seen birds, total count, % complete. Filterable. |
| **Completion stats per group** | M | "12/34 raptors seen". Progress bar per group. Makes the catalog feel finishable. |
| **Rarity distribution of your collection** | S | "You've spotted 2 Legendary birds." Visual breakdown by tier. |
| **First-seen date on detail page** | XS | "You first saw this on Jan 12, 2025." Tiny, meaningful. |
| **✦ FeatherScore** | M | A single number representing your collection weighted by rarity. Common = 1pt, Uncommon = 3, Rare = 9, Very Rare = 27, Legendary = 81. Displayed on the collection page. Makes rarity feel valuable. |
| **✦ Completion badges per group** | M | Bronze (25%), Silver (50%), Gold (100%) per group. Show on collection page. Feel like the gym badge system in Pokémon. |
| **Export my collection** | S | Download a JSON or CSV of your sightings. Respects the user's data ownership. |
| **✦ "Field Guide" PDF** | L | Generate a minimal PDF field guide of your seen birds. Premium feel, highly shareable. |

---

## Phase 3 — Play
**Theme: Make learning feel like a game**
**Moves: Session depth, 7-day retention**

Games create return habits. The key is to make these feel like natural extensions of the catalog, not bolted-on mechanics.

| Item | Effort | Notes |
|---|---|---|
| **Daily Quiz** — name the bird from its image | M | New page, one question per day, uses bird images already in the CDN. Answer revealed with full detail link. |
| **✦ Silhouette Challenge** — name the bird from a black silhouette | M | Derive silhouette from the image with CSS `filter: brightness(0)`. No new assets needed. Harder, more satisfying. |
| **✦ Bingo Card** | M | Generate a 3×3 bingo card of random birds to spot. "Find these 9 birds this weekend." Shareable as an image. Drives real-world birdwatching. |
| **✦ Duet mode — side-by-side comparison** | M | Compare any two birds' stats, size, IUCN status, habitat. Great for disambiguation. Detail mode layout (1024px) already supports two columns. |
| **✦ "Guess the Clues" — progressive reveal** | L | Show clues one at a time: habitat → size → colors → partial image. Guess the species. The fewer clues needed, the higher the score. |
| **Streak system** — daily visit streak | S | Track consecutive days the user opened the app. Small fire icon on the home hero. Resets at midnight. |
| **✦ Seasonal Challenge** — "Find all monsoon migrants before October" | M | Curated seasonal list with a deadline. Creates urgency and a real-world prompt to go outside. |

---

## Phase 4 — Connect
**Theme: Make the app feel alive with other people's presence**
**Moves: Share card sends, viral coefficient**

Community features are high-effort and high-risk — they require moderation and trust. Do the lightweight versions first. These should feel ambient, not social-media-loud.

| Item | Effort | Notes |
|---|---|---|
| **Share card improvements** — custom text/message in the share | S | Allow a short caption on the share card ("Spotted at Corbett!") |
| **Share my collection stats** — share a card of your FeatherScore and top birds | M | Extends the existing share card system with a new template |
| **✦ "How rare is your collection" share card** | M | A card that shows your rarity breakdown as a visual. Conversation starter. |
| **Community sighting count** — "X people have spotted this bird" | L | Requires a minimal backend collection (no auth needed — just an increment endpoint). Shows social proof on the detail page. |
| **✦ "Spotted today" feed** — lightweight anonymous sightings | XL | Shows recently logged birds across all users. No accounts, no photos, just "Lesser Flamingo spotted 3 times today." Needs privacy-first design. |
| **Conservation links** — for EN/CR species, link to WWF India / BirdLife | S | Pure editorial. Adds purpose and emotional weight to the endangered flags. |
| **Push notifications** — Bird of the Day via service worker | M | Already have a service worker. Add a daily notification opt-in. Only one notification type, one per day. |

---

## Phase 5 — Field
**Theme: Make the app useful when you're actually outside**
**Moves: Session depth on mobile, install rate**

Birdwatching happens in the field. An app that's only useful at a desk is leaving half its value on the table.

| Item | Effort | Notes |
|---|---|---|
| **Offline support for detail pages** — cache images on install | M | Service worker extension; cache the N most recently viewed bird pages |
| **"Near me" birds** — filter by current region/state | L | Use browser geolocation + map `Best_seen_at` data to regional codes. No GPS tracking stored. |
| **Migration calendar** — which birds are active this month | M | Visualize `Migration_status` across 12 months. A month-selector showing which foreign/migratory birds are expected now. |
| **✦ Quick-add sighting from notification** | M | From the Bird of the Day notification, swipe to mark as seen without opening the app |
| **✦ "What's flying now" seasonal home variant** | L | In monsoon, the home hero changes to "Monsoon arrivals" — a curated list of currently-migrating species. Seasonal branding. |
| **Compass mode** — habitat-based filter for your surroundings | M | "I'm at a wetland" shows all wetland birds sorted by ease of spotting. Field utility, zero GPS needed. |
| **Checklist mode** — printable/shareable list for a trip | M | User builds a list of target birds for a location, shares as link or PDF |

---

## Wild Bets ✦
**Theme: 10× ideas that could define what FeatherBase becomes**

These are moonshots. Each one could be the thing that makes the app famous, or could be wrong for this audience. Validate with users before building.

| Idea | Why It Could Be Big | Why It Might Not Work |
|---|---|---|
| **AI identification via camera** — point your phone at a bird | Merlin does this but not for India-first with this design quality | Huge ML infrastructure cost; Merlin has a 10-year head start |
| **✦ "Pokedex complete" moment** — when you see all 500 birds, something extraordinary happens | Completion is the most powerful motivator in any collection game. This is the end boss. | Most users will never get there; might feel unreachable |
| **✦ Living atlas — community-verified range maps** | Turn the `Best_seen_at` data into a map that grows with user sightings | Needs substantial user base before it's useful |
| **✦ School mode** — curated quiz sets for nature education curricula | Schools are an underserved distribution channel; teachers would love it | Requires curriculum alignment work |
| **✦ FeatherBase API** — public read API for developers | Builds ecosystem; other nature apps could embed it | Needs rate-limiting and terms |
| **✦ "Illustrator in residence"** — commission one original illustration per month | Creates editorial content; every illustration is a shareable moment | Cost and editorial coordination |
| **✦ NFC "field tag" stickers** — physical stickers you tap to open a bird's page | A physical touchpoint for nature trails and wildlife sanctuaries to adopt | Hardware logistics; niche use case |
| **✦ Rarity leaderboard** — which users have spotted the most Legendary birds this month | Pure engagement loop; creates aspiration | Needs community size to feel meaningful |

---

## Data Expansion Needed

Several Phase 1–3 features require enriching the data. These are content tasks, not engineering tasks.

| Data Gap | Needed For | Effort |
|---|---|---|
| Bird call audio URLs (Xeno-canto) | Phase 1 audio feature | M — scripted fetch by scientific name |
| "Often confused with" pairs | Phase 1 disambiguation | L — manual curation, ~50 pairs |
| State-wise range data | Phase 5 "near me" | M — derive from `Best_seen_at` field |
| Monthly activity calendar per bird | Phase 5 migration calendar | M — LLM-assisted from migration status |
| Conservation notes for EN/CR species | Phase 4 conservation links | S — editorial, 30–40 birds |
| More images per bird | All phases | Ongoing — currently many birds have 0–1 images |

---

## Dependency Map

```
Phase 0 (filters/sort)
  └── Phase 1 (discovery) — richer browse unlocks color/size/season filters
        └── Phase 2 (collection) — mark-as-seen needs a browsable catalog worth collecting
              ├── Phase 3 (play) — quiz/bingo only work if you have a collection to compare against
              └── Phase 4 (connect) — sharing a collection requires having one

Phase 5 (field) — parallel track, independent of phases 2–4
Wild Bets — only after Phase 2 proves the collection hook works
```

---

## What Not To Build

As important as the roadmap is what to avoid. These are things that seem obvious but would hurt the product:

- **User accounts / login** — adds enormous friction for zero immediate value. localStorage collection is better than a signup wall for 95% of users.
- **Comments / reviews on birds** — moderation cost exceeds value at this user scale.
- **Ads** — destroys the premium feel that makes the share card mean something.
- **A "for you" algorithm** — this is a catalog, not a feed. Serendipity should come from editorial features (Bird of the Day, Chaos Bird, seasonal), not a recommendation engine.
- **Leaderboards before community** — a leaderboard with 50 users is empty and sad. Build the collection layer first.

---

## Immediate Next Sprint

Based on effort-to-impact ratio, these five items should ship first:

1. **Advanced filters** (rarity, IUCN, habitat) — low effort, immediately makes the catalog more navigable
2. **"Mark as Seen" + My Collection page** — the retention hook; everything else in Phase 2 builds on this
3. **Random Bird button** — one endpoint, one button, surprisingly high engagement
4. **Daily Quiz** — creates the daily return habit that Bird of the Day alone can't sustain
5. **Bird calls via Xeno-canto** — the biggest functional gap; birding without sound is half the experience

---

*Last updated: April 2026*
