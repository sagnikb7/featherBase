# FeatherBase Design System — Revised

## 1. Design Critique

### What's working
- Font pairing (Manrope + Newsreader + DM Mono) is solid and distinctive.
- Paper grain texture adds character without distraction.
- Group color hashing is a clever identity system.
- The Pokedex mental model is clear and well-executed.
- Dark/light theming structure is sound.

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

---

## 3. Component Improvements

### 3.1 Header

| Property | Before | After |
|---|---|---|
| `.header-title` weight | 300 | 400 |
| `.header-logo` size | 22px | 24px |
| Bottom border | none | `1px solid var(--color-divider)` |

### 3.2 Bird List Rows

**Resting state:**
- `.bird-row-name`: weight 400 → 500
- `.bird-row-scientific`: `--text-xs` → `--text-sm`, weight 300 → 400
- `.bird-row-group`: font-size 10px → 11px, padding `2px 8px` → `3px 10px`
- Row dividers: already covered by `--color-divider` opacity increase

**Hover state (desktop):**
- Add `box-shadow: var(--shadow-sm)`
- Add `transform: translateX(2px)` with transition
- Keep background shift

**Active state (touch):**
- `background: var(--color-bg-muted)`
- `transform: scale(0.998)` for tactile feedback

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

### 3.6 Detail Page — Info Panels

| Property | Before | After |
|---|---|---|
| Background tint | `rgba(2,36,29,0.035)` | `rgba(2,36,29,0.05)` |
| Dark bg tint | `rgba(134,212,190,0.04)` | `rgba(134,212,190,0.06)` |
| Background image | none | `var(--surface-gradient)` |
| Border-top width | 1px | 2px |
| Border-top color opacity | current | increase to 15% opacity |
| Panel title icon opacity | 0.6 | 0.8 |

### 3.7 Bottom Nav

| Property | Before | After |
|---|---|---|
| Icon size | 22px | 24px |
| Label size | 10px | 11px |
| Shadow | none | `var(--shadow-up-sm)` |
| Active indicator | color only | color + `font-weight: 700` on label |

### 3.8 IUCN / Rarity Chips

- Font size: 11px → 12px
- Add `box-shadow: var(--shadow-xs)` for subtle lift
- IUCN dot: 8px → 9px

---

## 4. Mobile-Specific (6.1" target)

### Touch targets
- Bird row: minimum 48px total height (increase padding to `14px 16px`)
- Carousel arrows: 36px (up from 28px)
- Bird nav buttons (prev/next): padding `8px 12px`
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

## 5. Before → After Summary

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

## 6. Implementation Priority

1. **Tokens** (tokens.css) — colors, shadows, typography weights. Highest impact, lowest risk.
2. **Bird list rows** (search.css) — weight, size, spacing, hover/active states. Most-viewed component.
3. **Detail intro panel** (bird-detail.css) — shadow, weight, overlap. Biggest immersion payoff.
4. **Dark theme tuning** (tokens.css `.dark`) — border/divider visibility, text brightness.
5. **Mobile spacing** — tap targets, minimum font sizes across media queries.
6. **Bottom nav + header** (base.css) — icon size, label size, shadow, border.

---

## 7. Principles (Revised)

The original "no-line rule" and "no shadows" philosophy created the flatness problem. Revised principles:

1. **Subtle lines are fine.** A 1px divider at 12-18% opacity is not "visual noise" — it's a wayfinding aid. Invisible dividers are worse than visible ones.
2. **Shadows create hierarchy, not clutter.** Small, diffuse shadows (6-12% opacity) read as natural depth, not material design artifice.
3. **Dark mode needs more contrast, not less.** Surface steps must be 8+ lightness points apart. Text weights must be 400+. "Atmosphere" means nothing if users can't read.
4. **Mobile typography has a floor.** 11px minimum, 400 weight minimum in dark mode. No exceptions.
5. **Touch feedback is not optional.** Every tappable element needs a visible active state. Scale, shadow, or background shift — pick at least one.

---

## 8. Share Card System

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
