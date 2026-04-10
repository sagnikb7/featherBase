# Design System Specification: High-End Digital Field Guide
 
## 1. Overview & Creative North Star
The creative North Star for this design system is **"The Digital Curator."** 
 
Unlike a standard database, a curated experience feels intentional, spacious, and authoritative. We are moving away from the "app-like" density of traditional software toward a high-end editorial layout. This system prioritizes the subject matter—ornithology—through asymmetrical compositions, vast expanses of `surface` color, and a sophisticated interplay between academic serifs and modern sans-serifs. By treating digital real estate like a physical, museum-grade parchment, we create a sense of timelessness and prestige.
 
## 2. Color & Tonal Depth
The palette is rooted in the "Deep Forest and Earth" spectrum, utilizing muted greens, rich ochres, and bone-whites to evoke a naturalistic setting.
 
### The "No-Line" Rule
To achieve a premium editorial feel, **1px solid borders are strictly prohibited for sectioning.** Horizontal and vertical lines create visual noise that interrupts the "breath" of the page. Instead, define boundaries through:
*   **Background Shifts:** Use `surface-container-low` to distinguish a sidebar from a `surface` main content area.
*   **Whitespace:** Use the spacing scale to create "invisible" gutters that lead the eye.
 
### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use tonal nesting to define importance:
*   **Base:** `surface` (#fcf9f5) for the primary reading experience.
*   **Secondary Content:** `surface-container-low` (#f6f3ef) for secondary modules or filters.
*   **Interactive Layers:** `surface-container-highest` (#e5e2de) for elevated elements like search bars or active state containers.
 
### Glass & Gradient Transitions
For hero sections or floating navigation, utilize **Glassmorphism**:
*   Apply a `surface` color at 70% opacity with a `24px` backdrop-blur. 
*   **Signature Gradients:** For primary CTAs or interactive focal points, use a subtle linear gradient transitioning from `primary` (#02241d) to `primary-container` (#1a3a32). This adds a "soul" and depth that prevents the interface from looking digitally flat.
 
## 3. Typography
The typographic system is a dialogue between the tradition of scientific journals and the clarity of modern interfaces.
 
*   **Display & Headlines (Newsreader):** Use the Newsreader serif for all `display` and `headline` roles. This font carries an "academic weight" that lends credibility to species names and chapter titles.
*   **Body & UI (Manrope):** Use Manrope for all functional text. It is a highly legible sans-serif that balances the ornate nature of the serif headings.
*   **Hierarchy as Identity:** 
    *   **Scientific Names:** Always use `headline-sm` in italics to denote Latin nomenclature.
    *   **Data Labels:** Use `label-md` in all-caps with a `0.05rem` letter-spacing to create a "specimen tag" aesthetic.
 
## 4. Elevation & Depth
In this system, depth is organic, not artificial. We shun the "material" shadow in favor of environmental lighting.
 
*   **The Layering Principle:** Depth is primarily achieved through **Tonal Layering**. Place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#f6f3ef) background to create a soft, natural "lift."
*   **Ambient Shadows:** If a floating element (like a bird identification modal) requires a shadow, it must be an "Ambient Shadow." Use a blur of `40px`, a spread of `0`, and the `on-surface` color at `6%` opacity. 
*   **The Ghost Border Fallback:** If accessibility requirements demand a container boundary, use the **Ghost Border**: `outline-variant` (#c1c8c4) at 20% opacity.
 
## 5. Components
 
### Cards (The "Specimen" Card)
*   **Container:** No borders. Use `surface-container-low` for the base.
*   **Radius:** `lg` (0.5rem) to maintain a crisp, professional edge.
*   **Interaction:** On hover, shift background to `surface-container-high` and apply an Ambient Shadow.
 
### Buttons
*   **Primary:** Background of `primary` (#02241d), text `on-primary` (#ffffff). Shape: `full` (pill) for high-end modernism.
*   **Secondary:** Background of `secondary-container` (#dee2c9). No border.
*   **Tertiary:** No background. Text in `primary`. Use for low-emphasis actions like "Read More."
 
### Input Fields
*   **Style:** Minimalist. No enclosing box. Use a 2px bottom-stroke of `outline-variant`.
*   **Focus:** The bottom-stroke transitions to `primary` with a subtle `primary-fixed` glow.
 
### Chips & Filters
*   **Aesthetic:** Inspired by field tags. Use `secondary-fixed-dim` for unselected and `primary` for selected. 
*   **Typography:** Always `label-md`.
 
### Specialized Components: The Taxonomy Stack
A custom component for the bird encyclopedia. This is a vertical list of taxonomy levels (Order, Family, Genus) using `label-sm` for the key and `title-sm` for the value. Use vertical white space (1.5rem) instead of dividers to separate items.
 
## 6. Do’s and Don’ts
 
### Do:
*   **Embrace Asymmetry:** Place images off-center or allow them to bleed off the edge of the container to create a dynamic, editorial feel.
*   **Use High Contrast Scales:** Jump from a `display-lg` headline to a `body-md` description. The "gap" in size creates sophistication.
*   **Respect the "Breath":** If a section feels crowded, double the padding. The goal is a "Gallery" feel.
 
### Don't:
*   **Don't use 100% Black:** Use `on-background` (#1c1c19) for text to maintain a soft, natural look.
*   **Don't use Dividers:** Avoid horizontal lines between list items. Use tonal shifts or `2rem` spacing intervals.
*   **Don't Over-round:** Avoid the `xl` or `full` roundedness on large cards; keep them to `lg` to ensure the design feels "architectural" rather than "bubbly."