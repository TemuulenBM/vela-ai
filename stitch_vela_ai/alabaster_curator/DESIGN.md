# Design System Specification: The Alabaster Curator

## 1. Overview & Creative North Star

The Creative North Star for this design system is **"The Digital Curator."**

This system moves beyond the "app-like" utility of standard frameworks, instead adopting the sophisticated, airy presence of a high-end editorial look. It is built on the philosophy of **Atmospheric Luxury**: where the interface doesn't feel like a collection of boxes, but a series of curated elements suspended in a bright, ethereal space.

By leveraging **intentional asymmetry**, high-contrast typography, and **Frosted Crystal morphism**, we break the rigid "template" look. We prioritize negative space as a functional element, allowing the content to breathe and commanding the user’s attention through silence rather than noise.

---

## 2. Colors & Surface Philosophy

The color palette is a monochromatic study in "Off-White" and "Carbon." It relies on tonal shifts rather than lines to define architecture.

### Color Tokens

- **Background:** `#F9F9F9` (Surface) — The canvas.
- **Primary:** `#000000` — Used for high-authority text and primary actions.
- **Surface-Container-Lowest:** `#FFFFFF` — Used for floating glass cards and "frosted" elements.
- **Surface-Container-Low:** `#F3F3F3` — Subtle sectioning.
- **On-Surface-Variant:** `#474747` — Secondary metadata and "Soft Slate" accents.

### The "No-Line" Rule

**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment.
Boundaries must be defined solely through:

1. **Tonal Transitions:** Placing a `surface-container-low` section against a `surface` background.
2. **Depth Layering:** Using the multi-layered shadows of a `surface-container-lowest` card to create a natural edge.
3. **Negative Space:** Utilizing the `spacing-12` or `spacing-16` tokens to separate concepts.

### Surface Hierarchy & Nesting

Treat the UI as a physical stack of fine paper and frosted glass.

- **Base Layer:** `surface` (#F9F9F9).
- **Secondary Tier:** `surface-container-low` (#F3F3F3) for sidebar or background grouping.
- **Interactive Tier:** `surface-container-lowest` (#FFFFFF) for the "active" work area or primary cards.
- **The Glass & Gradient Rule:** For floating navigation or modal overlays, use `surface-container-lowest` at 70% opacity with a `backdrop-filter: blur(20px)`. This creates the signature "Frosted Crystal" effect, allowing underlying content to bleed through as soft, unrecognizable light.

---

## 3. Typography: Editorial Authority

The type system creates a rhythmic contrast between the intellectual warmth of **Instrument Serif** and the functional precision of **Barlow**.

| Level        | Token         | Font             | Size      | Case/Style              |
| :----------- | :------------ | :--------------- | :-------- | :---------------------- |
| **Display**  | `display-lg`  | Instrument Serif | 3.5rem    | _Italic_                |
| **Headline** | `headline-md` | Instrument Serif | 1.75rem   | _Italic_                |
| **Title**    | `title-lg`    | Barlow           | 1.375rem  | Medium                  |
| **Body**     | `body-lg`     | Barlow           | 1.0rem    | Regular                 |
| **Label**    | `label-sm`    | Barlow           | 0.6875rem | All Caps (Tracking +5%) |

**Editorial Intent:** Headlines should never be "just a title." They are statements. Use the italic `Instrument Serif` to evoke the feel of a premium masthead. Pair this with wide-set `Barlow` labels to maintain a contemporary, technical edge.

---

## 4. Elevation & Depth

Depth is achieved through **Tonal Layering** and **Ambient Shadows**, simulating a natural light source from the top-center.

### The Layering Principle

Do not use shadows to create "pop." Use shadows to create "lift."

- **Floating Glass:** When an element must float (e.g., a "Frosted Crystal" button or navigation bar), apply a multi-layered shadow:
  - Shadow 1: `0 4px 12px rgba(0,0,0,0.02)`
  - Shadow 2: `0 20px 40px rgba(0,0,0,0.04)`
- **The "Ghost Border" Fallback:** If accessibility requires a border (e.g., in high-contrast needs), use the `outline-variant` token (`#C6C6C6`) at **15% opacity**. Anything higher is considered a design failure in this system.

---

## 5. Components

### Buttons

- **Primary:** Solid `#000000` with white text. Use `rounded-full` for a "pill" aesthetic that feels Apple-inspired.
- **Frosted (Secondary):** White-on-white transparency (`#FFFFFF` at 60%), `backdrop-blur: 20px`, with black text.
- **Tertiary:** Pure text in `#000000` with an underline that only appears on hover.

### Cards & Containers

- **The Rule:** Cards must use `rounded-xl` (1.5rem) or `rounded-lg` (1.0rem).
- **Forbid Dividers:** Never use a horizontal line to separate content within a card. Use `spacing-4` (1.4rem) of vertical white space or a subtle shift to `surface-container-high` for a sub-section within the card.

### Chips

- **Selection:** `surface-container-highest` (#E2E2E2) with black text.
- **Inactive:** Transparent with a "Ghost Border" (15% opacity `#C6C6C6`).

### Input Fields

- Avoid "box" inputs. Use a "Soft Plate" approach: a `surface-container-low` background with a `rounded-md` corner. On focus, the background shifts to `surface-container-lowest` (pure white) with a soft ambient shadow.

---

## 6. Do's and Don'ts

### Do:

- **Use Intentional Asymmetry:** Align a display heading to the left while keeping the body text in a narrower, centered column to create an editorial layout.
- **Embrace White-on-White:** Trust the `blur(20px)` and the `0.04` opacity shadows to provide enough separation.
- **Variable Spacing:** Use the high end of the scale (`spacing-20` or `8.5rem`) between major sections to emphasize a "curated" feel.

### Don't:

- **Don't use 100% Black for everything:** While primary text is `#000000`, use `on-surface-variant` (`#474747`) for labels to prevent the UI from feeling too heavy.
- **Don't use "Glows":** We use soft shadows, not colored outer glows. This system is grounded in physical materials (glass, paper), not neon digital effects.
- **Don't use Standard Grids:** Avoid the "3-column card row" whenever possible. Try a large "Hero Card" followed by two smaller stacked elements to maintain the "Curator" aesthetic.
