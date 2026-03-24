# Design System Documentation: The Liquid Glass Framework

## 1. Overview & Creative North Star

**Creative North Star: "The Obsidian Curator"**
This design system rejects the standard "SaaS Dashboard" aesthetic in favor of a high-end editorial experience. It is designed to feel like a premium physical object—a slab of polished obsidian reflecting soft, ambient light.

By leveraging **Pure Black (#000000)** as a foundational void, we create a high-contrast environment where content doesn't just sit on a screen; it floats within it. We break the "template" look through intentional asymmetry, extreme typographic contrast, and a total rejection of traditional structural lines. Every element is defined by light and depth, not by borders.

---

## 2. Colors & Tonal Depth

### The Palette

The core of the system is built on a monochromatic foundation, using Material Design logic to manage light and shadow within a dark-mode-first environment.

- **Background (Pure Void):** `#000000` (The absolute base).
- **Surface Tiers:**
  - `surface_container_lowest`: `#0e0e0e` (Deepest recessive layer)
  - `surface_container`: `#1f1f1f` (Standard card base)
  - `surface_container_highest`: `#353535` (Active/Hover states)
- **Primary/On-Surface:** `#FFFFFF` (Pure white for maximum legibility and impact).

### The "No-Line" Rule

**Explicit Instruction:** Traditional 1px solid borders are strictly prohibited for sectioning.
Structure must be achieved through:

1.  **Tonal Transitions:** Moving from `background` (#000000) to `surface_container_low` (#1b1b1b).
2.  **Negative Space:** Utilizing the Spacing Scale (8, 12, 16) to create breathing room that implies boundaries.

### The "Glass & Gradient" Rule

To achieve the "Liquid Glass" look, floating elements (modals, navigation bars, dropdowns) must use:

- **Fill:** `rgba(255, 255, 255, 0.03)` to `0.08`.
- **Backdrop Blur:** A minimum of `20px` to `50px`.
- **The Inset Glow:** Use a `1px` white inset box shadow at `10-15%` opacity on the top edge to simulate light hitting the thickness of the glass.

---

## 3. Typography: Editorial Authority

The typographic scale creates a tension between the classic elegance of a serif and the technical precision of a sans-serif.

### Display & Headlines

- **Font:** `Instrument Serif` (Italic)
- **Character:** High contrast, tight tracking (-0.02em to -0.04em).
- **Usage:** Used for `display-lg` through `headline-sm`. These should feel like a magazine masthead—bold, graceful, and authoritative.

### Body & UI Labels

- **Font:** `Barlow` (Weights: 300, 400, 600)
- **Character:** Clean, airy, and functional.
- **Usage:**
  - **Body-lg/md:** Use weight 300 for long-form text to maintain a "light" feel against the black background.
  - **Labels/Titles:** Use weight 600 for high-scannability UI elements.

---

## 4. Elevation & Depth: The Layering Principle

We do not use shadows to lift objects; we use **Tonal Layering** and **Refraction**.

- **Stacking Surface Tiers:** Place a `surface_container_highest` element inside a `surface_container_low` section to create a natural, soft lift.
- **Ambient Shadows:** If a floating effect is required (e.g., a primary modal), use a shadow with a `60px` blur at `rgba(255, 255, 255, 0.04)`. This creates an "ambient glow" rather than a dark shadow, making the object appear to emit light.
- **The "Ghost Border" Fallback:** If accessibility requires a stroke, use the `outline_variant` token at `15%` opacity. Never use 100% opaque lines.

---

## 5. Components

### Buttons & Pills

- **Primary:** `rounded-full`, Background: `#FFFFFF`, Text: `#000000`. No shadow.
- **Secondary (Glass):** `rounded-full`, Background: `rgba(255, 255, 255, 0.05)`, Backdrop-blur: `12px`.
- **Interaction:** On hover, the glass opacity should increase to `0.15`.

### Cards

- **Shape:** `rounded-3xl` (3rem/48px) for large containers; `rounded-2xl` (1.5rem/24px) for nested content.
- **Style:** No borders. Use `surface_container_low` or a glass morphism treatment with an inset mask gradient to highlight the top-left corner.
- **Spacing:** Content within cards must use a minimum of `spacing-8` (2.75rem) padding to maintain the "airy" feel.

### Input Fields

- **Base:** `rounded-full` for search/single-line; `rounded-xl` for text areas.
- **State:** Background `surface_container_lowest`. On focus, transition to a `10%` white glass fill with a subtle "Ghost Border."

### Lists & Dividers

- **Rule:** **Forbid divider lines.**
- **Implementation:** Separate list items using `spacing-2` (0.7rem) gaps or by alternating between `background` and `surface_container_lowest` subtle fills.

### Navigation (The Floating Dock)

- A `rounded-full` pill floating at the bottom or top of the viewport.
- **Effect:** Deep blur (`40px`), `rgba(255, 255, 255, 0.05)` fill, and a gradient border mask that simulates a "liquid" edge.

---

## 6. Do’s and Don’ts

### Do:

- **Embrace the Void:** Let large areas of `#000000` exist. White space (or "Black Space") is a luxury.
- **Use Asymmetry:** Place display text off-center or overlapping a glass card to break the "grid" feel.
- **Tighten Tracking:** Ensure `Instrument Serif` is always tight; loose tracking on serifs breaks the premium feel.

### Don't:

- **Never use Grey Text:** For hierarchy, use White (`#FFFFFF`) and adjust the **opacity** (e.g., 70%, 45%) rather than choosing a flat grey hex code. This ensures the "light" feels consistent.
- **No Sharp Corners:** Avoid any radius below `0.5rem` unless it is a 1px detail. The system should feel organic and "liquid."
- **No Drop Shadows:** Avoid standard black drop shadows. They disappear on a black background and look muddy on glass. Use ambient glows or tonal shifts instead.
