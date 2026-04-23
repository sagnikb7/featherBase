# FeatherBase Design System — Revised

## 1. Design Critique

### What's working
- Font pairing (Manrope + Newsreader + DM Mono) is solid and distinctive.
- Paper grain texture adds character without distraction.
- Group color hashing is a clever identity system.
- The Pokédex mental model is clear and well-executed.
- Dark/light theming structure is sound.
- Habitat, diet, and best seen at all use the same `.tag-row` pill pattern — consistent across all array fields. Panel title icons (`i-ph-tree-evergreen`, `i-ph-bowl-food`) carry the semantic meaning; individual items are text only.
- Clickable group pill on detail page navigates to home filtered by group — caret icon (`i-ph-caret-right`) at 70% opacity slides right on hover, signalling interactivity.
- `bestSeenAt` stored as `[String]` (migrated from string in April 2026) — rendered as pills on the detail page; no icon repetition needed since the label contextualises the field.
- Size typography: `LARGE · 75 cm` — category in small-caps Manrope 700, measurement in DM Mono in group accent. Clean, field-guide honest, no widget chrome.

### What's not working

**Flatness everywhere.** `--shadow-card: none` is the root problem. Every surface sits at the same elevation — cards, headers, panels all blend into one plane. The "no-line rule" from the original spec was aspirational but resulted in invisible boundaries. Tonal nesting alone cannot carry hierarchy when the tonal steps are 5-6 lightness points apart.

**Dark theme is muddy.** The dark palette (`#0d1512` → `#141e1a` → `#1a2824`) has almost no perceptible contrast between surface tiers. Everything collapses into uniform dark green. The accent (`#86d4be`) is the only bright element, making the rest feel dead.

**Typography is too thin and too small on mobile.** `font-weight: 300` for the header title, `font-weight: 400` for bird names, `10px` for group chips — legible on a retina Mac, illegible on a 6.1" phone at arm's length. Newsreader at 300 weight disappears in dark mode.

**No visual rhythm on the list page.** Bird rows are functionally a table with no visual anchoring. No hover depth, no row differentiation, no micro-interactions that reward exploration. The 1px divider at 6% opacity is invisible.

**Detail page panels are visually interchangeable.** The intro panel and habitat/diet panels use near-identical styling. No visual hierarchy distinguishes "hero section" from "supplementary data."

---

## 2. Revised Design Tokens

### 2.1 Color Palette

#### Light theme (tuned for warmth)

| Token | Before | After | Why |
|---|---|---|---|
| `--color-bg` | `#fcf9f5` | `#faf7f2` | Warmer, less washed |
| `--color-bg-raised` | `#ffffff` | `#ffffff` | Keep — white on warm bg creates lift |
| `--color-bg-input` | `#f6f3ef` | `#f4f1eb` | Match warmth shift |
| `--color-bg-muted` | `#e5e2de` | `#e8e4de` | Warmer interactive surfaces |
| `--color-border` | `rgba(193,200,196,0.2)` | `rgba(180,175,165,0.25)` | Warmer, more visible |
| `--color-divider` | `rgba(193,200,196,0.12)` | `rgba(180,175,165,0.18)` | Must be perceptible |

#### Dark theme (primary — significant rework)

| Token | Before | After | Why |
|---|---|---|---|
| `--color-bg` | `#0d1512` | `#0c1210` | Deeper true-dark base |
| `--color-bg-raised` | `#141e1a` | `#162220` | More contrast from bg |
| `--color-bg-input` | `#1a2824` | `#1e2e29` | Wider separation from raised |
| `--color-bg-muted` | `#253530` | `#2a3b35` | Interactive states need visibility |
| `--color-text` | `#e1e3de` | `#e8eae5` | Brighter — 92% vs 88% luminance |
| `--color-text-muted` | `#8a9b94` | `#96a9a1` | +8% brightness for mobile readability |
| `--color-text-faint` | `#5e6f68` | `#6d7f77` | Was too faint, especially on mobile |
| `--color-border` | `rgba(193,200,196,0.1)` | `rgba(160,190,178,0.14)` | Borders need to read |
| `--color-divider` | `rgba(193,200,196,0.06)` | `rgba(160,190,178,0.12)` | Row dividers must be visible |
| `--color-accent` | `#86d4be` | `#7ecdb7` | Slightly desaturated, easier on eyes |
| `--color-accent-light` | `rgba(134,212,190,0.1)` | `rgba(126,205,183,0.13)` | Slightly more visible hover states |
| `--glass-bg` | `rgba(13,21,18,0.7)` | `rgba(12,18,16,0.80)` | More opaque for text readability |

### 2.2 Elevation System (New)

Replace `--shadow-card: none` with a proper elevation scale:

```css
:root {
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.05);
  --shadow-up-sm: 0 -1px 6px rgba(0,0,0,0.06);
}

.dark {
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.20);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.24), 0 1px 2px rgba(0,0,0,0.14);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.28), 0 1px 3px rgba(0,0,0,0.18);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.18);
  --shadow-up-sm: 0 -1px 6px rgba(0,0,0,0.18);
}
```

Subtle surface gradient for panels (adds dimensionality without a second color):
```css
:root {
  --surface-gradient: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%);
}
.dark {
  --surface-gradient: linear-gradient(180deg, rgba(255,255,255,0.025) 0%, transparent 100%);
}
```

### 2.3 Typography

#### Scale

| Token | Before | After | Why |
|---|---|---|---|
| `--text-xs` | `0.75rem` (12px) | `0.8125rem` (13px) | 12px is below comfortable mobile minimum |
| `--text-display` | `2.75rem` (44px) | `2.5rem` (40px) | Let weight do the work, not size |

All other scale values unchanged.

#### Weight corrections

| Element | Before | After | Why |
|---|---|---|---|
| Header brand title | 300 | 400 | 300 is ghostly for nav branding |
| Bird name (list row) | 400 | 500 | Must anchor the row visually |
| Bird name (detail hero) | 500 | 600 | Hero element needs presence |
| Scientific name (everywhere) | italic 300 | italic 400 | 300 italic nearly invisible in dark mode |
| Group chips text | 600 @ 10px | 600 @ 11px | Below minimum readable size |
| Meta labels (detail) | 600 @ 10px | 700 @ 11px | Same — must be legible |
| Detail callout text | 300 | 400 | 300 on mobile dark mode is unreadable |
| Panel title icons | opacity 0.6 | opacity 0.8 | Icons should guide, not hide |

#### Rule: no weight below 400 in dark mode, no text below 11px anywhere.

#### Font role assignments

Each font has a strict domain. Mixing them outside their domain is a bug.

| Font | Token | Domain |
|---|---|---|
| Manrope | `--font-sans` | Labels, buttons, chips, meta labels, UI chrome, section headers |
| Newsreader | `--font-serif` / `--font-display` | Bird names, scientific names, body text, the hero title "feather" word |
| DM Mono | `--font-mono` | **Data only** — serial numbers, species counts, numerical values |

**DM Mono is for data, not labels.** "Bird of the Day", "Field Index", section headings — these are labels, not data. They use `--font-sans`. Only use `--font-mono` when the value is a number, code, or identifier that benefits from fixed-width rendering (serials like `#0042`, counts like `600`).

**`--font-display` and `--font-serif` are the same font (Newsreader).** The distinction is semantic — display for large hero text, serif for body. Do not introduce a different display font without updating both tokens.

---

## 3. Component Improvements

### 3.1 Home Page Hero

`TheHeader.vue` (sticky site header) was removed. The home page now owns its own inline hero: `.page-hero` with logo, title ("FeatherBase"), and tagline ("Birds of the Indian Subcontinent"). No persistent header chrome above the list — cleaner on mobile.

**Bird of the day:** seeded by `Math.floor(Date.now() / 86400000) % total` — same bird for all users on a given day. Rendered as a card above the bird list. Non-critical; silently omitted on fetch failure.

**Group chips:** up to 8, seeded-shuffled daily using `seededShuffle()` (LCG with `todaySeed`). Each chip shows the group name and bird count. Consistent order within a day; rotates overnight without being random per visit.

### 3.2 Bird List Rows

**Resting state:**
- `.bird-row-name`: weight 500
- `.bird-row-scientific`: `--text-sm`, weight 400
- `.bird-row-group`: font-size 11px, padding `3px 10px`
- Row padding: `14px var(--space-4)` for 48px touch target
- Row dividers: `1px solid var(--color-divider)` (12-18% opacity — must be visible)
- Entrance animation: `row-enter` (opacity 0 → 1, translateY 8px → 0), staggered 28ms per row for first 8, disabled via `prefers-reduced-motion`

**Per-row identity via CSS variables (set as inline style from `groupColor()`):**
- `--row-accent`: group text color — used for left accent bar, serial on hover
- `--row-accent-bg`: group bg color — used for hover background tint

**Hover state (desktop):**
- `box-shadow: inset 3px 0 0 var(--row-accent), var(--shadow-sm)` — left accent bar via inset shadow (zero layout impact), combined with elevation
- `background: var(--row-accent-bg)` — group-tinted background, not generic `--color-bg-input`
- `transform: translateX(4px)`
- `.bird-row-serial` color → `var(--row-accent)`
- `.bird-row-arrow` slides in from `translateX(-4px)` → 0

**Active state (touch):**
- `background: var(--color-bg-muted)`
- `transform: scale(0.998)` for tactile feedback
- `box-shadow: none`

### 3.3 Search

- Input `border-bottom`: increase to `rgba(160,190,178,0.5)` in dark (currently too faint)
- Focus glow: `box-shadow: 0 4px 16px var(--color-accent-light)` (more visible)
- Dropdown: add `border: 1px solid var(--color-border)` in dark mode (currently blends into bg)

### 3.4 Detail Page — Image

- Add bottom gradient overlay on image container: `linear-gradient(transparent 60%, rgba(0,0,0,0.25))` — creates depth where intro panel overlaps
- Image tags: 10px → 11px, padding `3px 10px` → `4px 12px`
- Carousel arrows (mobile): 28px → 36px for touch comfort

### 3.5 Detail Page — Intro Panel

| Property | Before | After |
|---|---|---|
| Bird name weight | 500 | 600 |
| Scientific name weight | 300 | 400 |
| Serial number size | `--text-sm` | `--text-base` |
| Mobile overlap | `margin-top: -20px` | `margin-top: -24px` |
| Shadow (mobile) | none | `0 -4px 20px rgba(0,0,0,0.08)` light / `0 -4px 20px rgba(0,0,0,0.25)` dark |

The upward shadow sells the overlap illusion and creates the single biggest "depth" improvement in the app.

### 3.6 Detail Page — Data Fields (v2 schema, 2026.04+)

Birds updated via `upsert-birds-v2.js` carry a `version` field (`"YYYY.MM"` string). Frontend gates new fields on `version >= '2026.04'`.

**New fields rendered on detail page:**

| Field | Display | Notes |
|---|---|---|
| `lengthCm` | Size typography `LARGE · 75 cm` | Replaces `sizeRange` string for v2 birds. `sizeRange` kept for backward compat — TODO: retire once all birds updated. |
| `weightG` / `wingspanCm` | `intro-meta` grid rows 3+4 — `715–1015 g` / `85–95 cm`. Conditional on field presence (v2 only). |
| `seasonalityInIndia` | Habitat & Range panel — standalone `detail-meta-item` below the Distribution/Migration pair. Conditional. |
| `callDescription` | Not yet surfaced — prior attempt broke layout | Needs isolated panel with careful mobile testing |
| `juvenileDescription` / `similarSpecies` | Not yet surfaced | Reserved for next detail page phase |

**Rule:** Never surface a new v2 field without testing on mobile (6.1" target). The call description panel was reverted because it disrupted layout — add a `v-if` guard and test panel height on mobile before re-adding.

**Size display rule:** `LARGE · 75 cm` — category in small-caps (`text-transform: uppercase`, `letter-spacing: 0.07em`, `font-weight: 700`, `--font-sans`), separator `·`, measurement in `--font-mono` in group accent color. No visual indicator (ruler, pip dots, etc.) — the word is self-explanatory.

### 3.6b Detail Page — Info Panels

| Property | Before | After |
|---|---|---|
| Background tint | `rgba(2,36,29,0.035)` | `rgba(2,36,29,0.05)` |
| Dark bg tint | `rgba(134,212,190,0.04)` | `rgba(134,212,190,0.06)` |
| Background image | none | `var(--surface-gradient)` |
| Border-top width | 1px | 2px |
| Border-top color opacity | current | increase to 15% opacity |
| Panel title icon opacity | 0.6 | 0.8 |

**Array field display pattern (established 2026.04):**

All three array fields — Habitat, Diet, Best seen at — use the same visual treatment: `.tag-row` of `.detail-tag` pills. One pattern, no exceptions.

The panel title (`i-ph-tree-evergreen` for Habitat, `i-ph-bowl-food` for Diet) carries the semantic meaning for the whole section. Individual items are text; they do not need icons.

**Why no per-item icons:** The dataset has 190+ unique habitat values and 87+ diet values. No icon set can meaningfully represent that vocabulary — any mapping either repeats the same icon (decoration, not information) or gets the wrong icon (noise). Regex-based mapping was tried and removed. Static lookup maps would require 280+ maintained entries. The text is already descriptive: "mangrove creeks", "large fish", "wasp larvae" need no icon gloss.

**Rule:** never repeat the same icon on every item in a list — if the icon is the same for all items, it's decoration not information. Use the label instead. If a vocabulary is too large and varied to map meaningfully (>20 unique values), use text only.

### 3.7 Bottom Nav

The dark-mode toggle button was removed from BottomNav. Theme is now controlled via the Settings page. Nav items are now **Birds** (home, `i-ph-bird-duotone`) and **Settings** (`i-ph-gear-duotone`) — both `<RouterLink>` with active class.

| Property | Before | After |
|---|---|---|
| Items | Home + Dark toggle | Birds + Settings (router links) |
| Icon size | 22px | 24px |
| Label size | 10px | 11px |
| Shadow | none | `var(--shadow-up-sm)` |
| Active indicator | color only | color + `font-weight: 700` on label |

### 3.8 Settings Page

Route `/settings`. Layout: centered column, `max-width: 720px`. Two sections — Appearance and Spread the Word — then an About card at bottom.

**Theme picker:** 3-column grid for light/dark/auto. Midnight is a full-width row (`grid-column: 1 / -1`) in horizontal layout with a shimmer animation (`midnight-sheen` keyframes) when unlocked, hidden until the user completes the "Spread the Word" action.

**Spread the Word card:** sharing the bird-of-the-day card via Web Share API unlocks the Midnight theme. On success: `unlockMidnight()` + `fireUnlockConfetti()` + `.spread-success` reveal (CSS `v-if` animation, no `<Transition>` wrapper needed).

**Midnight theme tokens** (`.dark.midnight` in `tokens.css`): deep violet base `#09091a`, accent `#a78bfa`, surface gradient uses violet at 2.5%. All elevation shadows are tuned for the violet palette. The `midnight` class is applied to `<html>` alongside `dark`.

### 3.9 IUCN / Rarity Chips

- Font size: 11px → 12px
- Add `box-shadow: var(--shadow-xs)` for subtle lift
- IUCN dot: 8px → 9px

---

## 4. Layout Mode System

There are exactly two layout modes in FeatherBase. Every page must fit one of them.

### Browse mode — `max-width: 720px`
Used by: home (`/`), settings (`/settings`), any future list or utility pages.

Single-column, centered within a 720px shell. The bottom nav also caps at 720px. This constraint exists by design — it keeps text line lengths readable, gives the app a focused Pokédex feel, and ensures the nav and content always align.

**Rule: any new browse-mode page must use `max-width: 720px` on its root container.**

### Detail mode — `max-width: 1024px`
Used by: bird detail (`/bird/:id`).

Two-column grid (`1fr 1fr`), `height: calc(100vh - 60px)`, centered within a 1024px shell. This is wider than browse mode by design — the detail page is an immersive "dossier" experience, not a list. At 1024px each column is ~512px: adequate for an image carousel and comfortable for body text.

**Rule: `max-width` must not exceed 1024px on the detail page. Do not shrink it to 720px — the columns would be too narrow for the image.**

On mobile (`≤ 768px`) the detail page collapses to a single-column stacked layout (flex, `height: auto`).

---

## 5. Microinteraction System

Every interactive element in FeatherBase belongs to exactly one of three tiers. The tier determines the hover and active treatment. Mixing tiers on the same element is a bug.

### The Three Tiers

#### Tier 1 — Primary CTA
**One per screen. High commitment. Fills with color.**

The most visually prominent interactive state in the app. Reserved for the single action the page is built around. On hover, the surface floods with the accent color and the text inverts. On active, no additional transform — the fill is enough weight.

```css
/* hover */
background: var(--color-accent);
color: var(--color-bg);

/* active — no transform, fill is already decisive */
opacity: 0.9;
```

**Examples:** Share Bird Card button (`.bird-share-cta`), Install button (`.install-pill-btn`).  
**Rule:** There should be at most one Tier 1 element visible on screen at a time. If two primary CTAs compete, one of them is wrong.

---

#### Tier 2 — Utility / Ghost Buttons
**Repeated controls. Light weight. Tint on hover.**

Used for navigation controls, icon buttons, and any repeated button that doesn't trigger a significant action. On hover, the background picks up a light `accent-light` tint and the text shifts toward accent or full text color. No transform — these buttons don't move.

```css
/* hover */
background: var(--color-accent-light);
color: var(--color-text);        /* or var(--color-accent) */

/* active */
background: var(--color-bg-muted);
```

**Examples:** Prev/Next bird nav (`.bird-nav-btn`), header icon buttons (`.header-btn`), group chips on the home page (`.group-chip`), nav buttons (`.bird-nav-btn`), spread/cache action buttons.  
**Rule:** Tier 2 elements do not move (no `translateY`, no `translateX`). Motion is reserved for Tiers 1 and 3.

---

#### Tier 3 — Navigational Pills
**Inline chips that navigate. Lift + shadow on hover.**

Used for pills and chips embedded in content that take the user somewhere else. On hover, the element lifts with `translateY(-1px)` and a shadow appears beneath it — the shadow is the physical consequence of the lift. On active (press), the lift reverses and the shadow disappears.

```css
/* hover */
transform: translateY(-1px);
box-shadow: 0 3px 8px rgba(0,0,0,0.12);   /* light */
/* dark: */
box-shadow: 0 3px 8px rgba(0,0,0,0.32);

/* active */
transform: translateY(0);
box-shadow: none;
```

**Why not `filter: brightness()`?** `brightness()` is a CSS filter hack with no semantic grounding. It composites differently depending on what's behind the element, behaves inconsistently on inline-colored elements (like group pills with dynamic background), and tells the user nothing about intent. The lift + shadow metaphor communicates "this goes somewhere" — the same cue used in physical interfaces for buttons and links.

**Examples:** Clickable group pill on detail page (`.detail-tag--clickable`).  
**Rule:** The arrow icon inside a Tier 3 pill slides `translateX(2px)` on hover as a secondary directional cue. Do not add a brightness filter on top.

---

### Transition Tokens

All interactive transitions use the pre-defined tokens, never raw durations:

| Token | Value | Use |
|---|---|---|
| `--transition-fast` | `0.12s ease-out` | All hover/active states |
| `--transition-base` | `0.2s cubic-bezier(0.25, 0.1, 0.25, 1)` | Entrance animations, state changes |
| `--transition-gentle` | `0.35s cubic-bezier(0.4, 0, 0.2, 1)` | Heavy elements, overlays |

**Rule:** Hover transitions are always `--transition-fast`. Page entrance animations use `--transition-base` or a named cubic-bezier. Never raw `ms` values in component CSS. One-shot animations (BOTD entrance, BOTD shimmer, row stagger) may use custom cubic-bezier values directly since they are not interactive states.

---

### Tier Assignment Reference

| Element | Tier | Rationale |
|---|---|---|
| Share Bird Card button | 1 | Primary action on detail page |
| Install PWA button | 1 | Primary action on settings page |
| Spread the Word button | 1 | Primary action, unlocks feature |
| Prev / Next bird nav | 2 | Repeated navigation control |
| Header icon buttons | 2 | Utility icons |
| Home group chips | 2 | Filter controls, not navigation away |
| Bottom nav items | 2 | Navigation tabs (no transform) |
| Clickable group pill (detail) | 3 | Inline chip — navigates to a different page |
| Cache clear button | 2 | Utility action |

---

### What Breaks Consistency

1. **`filter: brightness()` on any element** — remove it. It has no place in this system.
2. **`translateY` on a Tier 2 button** — motion is reserved for Tiers 1 and 3.
3. **Fill-on-hover for a Tier 3 pill** — fill belongs to Tier 1. Pills lift.
4. **Two Tier 1 elements on the same screen** — one must be demoted.
5. **Raw `box-shadow` values in component CSS** — use elevation tokens (`--shadow-xs`, `--shadow-sm`, etc.) or the Tier 3 lift shadow exactly as specified above.

---

## 6. Mobile-Specific (6.1" target)

### Touch targets
- Bird row: minimum 48px total height (increase padding to `14px 16px`)
- Carousel arrows: 36px (up from 28px)
- Bird nav buttons (prev/next): padding `8px 12px` + `min-height: 44px` — padding alone gives ~35px, min-height enforces the touch target floor
- Bottom nav items: ensure 48px tap square

### Typography floors
- No text below 11px anywhere
- No `font-weight: 300` in dark mode (minimum 400)
- Bird name on list: 16px weight 500

### Spacing
- Bird row gap: 12px (up from 8px on mobile)
- Search container margin-top: 24px (up from 20px)
- Detail intro overlap: -24px (up from -20px)
- Search dropdown max-height: 45vh (down from 50vh — bottom nav occludes last items)

### Visual density
- ~8 rows visible on 6.1" screen. This is comfortable — do not try to cram more.

---

## 7. Before → After Summary

### Bird list row (dark mode)
```
BEFORE                              AFTER
──────                              ─────
divider: 6% opacity (invisible)     divider: 12% opacity (visible)
name: Newsreader 16px/400 (thin)    name: Newsreader 16px/500 (anchored)
sci: 12px/italic/300 (invisible)    sci: 14px/italic/400 (readable)
chip: 10px (tiny)                   chip: 11px, pad 3px 10px (tappable)
hover: bg only                      hover: bg + shadow-sm + translateX(2px)
active: bg-muted                    active: bg-muted + scale(0.998)
```

### Detail page intro (mobile dark)
```
BEFORE                              AFTER
──────                              ─────
name: 28px/500 (adequate)           name: 28px/600 (hero presence)
sci: 14px/italic/300 (fades)        sci: 14px/italic/400 (readable)
serial: 14px (understated)          serial: 16px (confident)
panel: flat, no shadow              panel: upward shadow + -24px overlap
```

### Dark theme surfaces
```
BEFORE                              AFTER
──────                              ─────
#0d1512 → #141e1a → #1a2824        #0c1210 → #162220 → #1e2e29
Delta: ~5-6 lightness steps         Delta: ~8-10 lightness steps
Shadows: none                       Shadows: 4-tier elevation scale
Result: flat, indistinguishable     Result: perceptible hierarchy
```

---

## 8. Implementation Priority

1. **Tokens** (tokens.css) — colors, shadows, typography weights. Highest impact, lowest risk.
2. **Bird list rows** (search.css) — weight, size, spacing, hover/active states. Most-viewed component.
3. **Detail intro panel** (bird-detail.css) — shadow, weight, overlap. Biggest immersion payoff.
4. **Dark theme tuning** (tokens.css `.dark`) — border/divider visibility, text brightness.
5. **Mobile spacing** — tap targets, minimum font sizes across media queries.
6. **Bottom nav + header** (base.css) — icon size, label size, shadow, border.

---

## 9. Principles (Revised)

The original "no-line rule" and "no shadows" philosophy created the flatness problem. Revised principles:

1. **Subtle lines are fine.** A 1px divider at 12-18% opacity is not "visual noise" — it's a wayfinding aid. Invisible dividers are worse than visible ones.
2. **Shadows create hierarchy, not clutter.** Small, diffuse shadows (6-12% opacity) read as natural depth, not material design artifice.
3. **Dark mode needs more contrast, not less.** Surface steps must be 8+ lightness points apart. Text weights must be 400+. "Atmosphere" means nothing if users can't read.
4. **Mobile typography has a floor.** 11px minimum, 400 weight minimum in dark mode. No exceptions.
5. **Touch feedback is not optional.** Every tappable element needs a visible active state. Scale, shadow, or background shift — pick at least one.

---

## 10. Share Card System

### Design Philosophy
Minimal, premium, shareable. The card uses exactly **3 colors**: a near-black base, white text, and ONE accent color determined by rarity. No gradients, no textures, no ornate borders. The bird image is the hero; the typography is confident; the accent color is the personality.

Optimized for WhatsApp status, Instagram stories, and chat sharing. Must look good at thumbnail size.

### Dimensions
- **Logical:** 630 × 880px (5:7 trading card ratio)
- **Rendered:** 1260 × 1760px (2x for retina/high-DPI)
- **Corner radius:** 16px
- **Format:** PNG

### Palette (per card — always dark, no theme branching)
- **Base:** `#0C0C0C` (neutral near-black — no green/blue tint)
- **Surface:** `#161616` (info section, slightly lifted)
- **Text:** `#F5F5F5` (primary), `#999999` (secondary), `#555555` (tertiary)
- **Accent:** one color, determined by rarity (see below)

### Layout
```
┌──────────────────────────────┐
│▓▓▓▓▓▓ accent top bar ▓▓▓▓▓▓│  ← 0-6px, scales with rarity
│  ┌──────────────────────┐   │
│  │                      │   │
│  │    BIRD IMAGE        │   │
│  │    (cover crop)      │   │
│  │                      │   │
│  │  #042                │   │  ← serial pill, bottom-left of image
│  └──────────────────────┘   │
│                              │
│  Indian Roller               │  ← big bold serif name
│  Coracias benghalensis       │  ← italic, secondary color
│                              │
│  ┌─────────┐ ┌───────────┐  │
│  │ waders  │ │ ● LC      │  │  ← chips
│  └─────────┘ └───────────┘  │
│  ────────────────────────── │  ← thin divider (accent or grey)
│  HABITAT      SIZE          │
│  wetlands     medium · 30cm │  ← 2-col metadata
│  COLORS       DIET          │
│  blue, green  insects       │
│                              │
│       ★ RARE                 │  ← rarity label, centered, accent
│    featherbase.netlify.app   │  ← footer
└──────────────────────────────┘
```

### Rarity Accent Colors

Each tier gets ONE accent color. The accent is used progressively — higher tiers use it in more places.

| Tier | Accent | Border | Bar | Serial | Divider | Name |
|---|---|---|---|---|---|---|
| 1 Common | `#7A8B7A` sage | 1.5px | — | grey | grey | white |
| 2 Uncommon | `#4ECDC4` mint | 2px | 3px | grey | grey | white |
| 3 Rare | `#7C5CFC` violet | 2.5px | 4px | accent | grey | white |
| 4 Very Rare | `#FFB800` gold | 3px | 5px | accent | accent | white |
| 5 Legendary | `#FF6B35` coral | 3.5px | 6px | accent | accent | accent |

**Progressive accent usage:** Common cards are almost monochrome. Legendary cards are drenched in their accent. Same layout, same structure — just more color saturation as rarity increases.

### Typography
- **Bird name:** Newsreader 36px/700 (28px if > 20 chars) — the hero element
- **Scientific name:** Newsreader italic 15px/400
- **Chips:** Manrope 12px/600
- **Meta labels:** Manrope 10px/700 uppercase, letter-spaced
- **Meta values:** Manrope 13px/400
- **Serial:** DM Mono 13px/700
- **Rarity label:** Manrope 13px/700 uppercase, letter-spaced, accent color
- **Footer:** Manrope 11px/400, 30% opacity

### Technical
- **Canvas API** — html-to-image is unreliable
- Image via proxy endpoint, direct URL fallback
- No grain/texture — clean flat surfaces
- Web Share API with file, download fallback
- No dark/light branching — always dark
