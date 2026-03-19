---
name: minimalist-ui
description: Clean editorial-style interfaces. Warm monochrome palette, typographic contrast, flat bento grids, muted pastels. No gradients, no heavy shadows.
---

# Protocol: Premium Utilitarian Minimalism UI Architect

## 1. Protocol Overview
An advanced frontend directive for generating ultra-minimalist, "document-style" web interfaces. Enforces warm monochrome palette, bespoke typographic hierarchies, meticulous macro-whitespace, bento-grid layouts, and ultra-flat component architecture with muted pastel accents.

## 2. Absolute Negative Constraints (Banned)
- NO "Inter", "Roboto", or "Open Sans"
- NO generic thin-line icon libraries (Lucide, Feather, standard Heroicons)
- NO default heavy drop shadows (`shadow-md`, `shadow-lg`, `shadow-xl`)
- NO primary colored backgrounds for large sections
- NO gradients, neon colors, or 3D glassmorphism
- NO `rounded-full` for large containers or primary buttons
- NO emojis anywhere
- NO generic placeholder names or AI copywriting cliches

## 3. Typographic Architecture
- **Primary Sans-Serif:** `SF Pro Display`, `Geist Sans`, `Switzer`
- **Editorial Serif (Heroes):** `Newsreader`, `Playfair Display`, `Instrument Serif`. Tight tracking, tight line-height.
- **Monospace (Meta):** `Geist Mono`, `SF Mono`, `JetBrains Mono`
- Body text: off-black (`#111111` or `#2F3437`), `line-height: 1.6`. Secondary: `#787774`.

## 4. Color Palette (Warm Monochrome + Spot Pastels)
- **Canvas:** `#FFFFFF` or `#F7F6F3`
- **Borders:** `#EAEAEA` or `rgba(0,0,0,0.06)`
- **Accents:** Desaturated pastels only — Pale Red `#FDEBEC`, Pale Blue `#E1F3FE`, Pale Green `#EDF3EC`, Pale Yellow `#FBF3DB`

## 5. Component Specifications
- **Bento Grids:** Asymmetrical CSS Grid. `border: 1px solid #EAEAEA`. Radius `8px`-`12px`. Padding `24px`-`40px`.
- **CTAs:** `bg-[#111111] text-white`. Radius `4px`-`6px`. No shadow. Hover: `scale(0.98)`.
- **Tags:** Pill-shaped, `text-xs`, uppercase, wide tracking, muted pastel backgrounds.
- **Accordions:** No container boxes. `border-bottom: 1px solid #EAEAEA`. Clean `+`/`-` toggle.
- **Keystrokes:** `<kbd>` tags with border, monospace font.

## 6. Iconography & Imagery
- Use Phosphor Icons (Bold/Fill) or Radix UI Icons.
- Photography: desaturated, warm tone. Subtle overlays.
- Reliable placeholders: `https://picsum.photos/seed/{context}/1200/800`

## 7. Subtle Motion
- **Scroll Entry:** `translateY(12px)` + `opacity: 0` over `600ms` with `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Hover:** Ultra-subtle shadow shift over `200ms`. `:active` scale `0.98`.
- **Staggered:** `animation-delay: calc(var(--index) * 80ms)`.
- Animate exclusively via `transform` and `opacity`.

## 8. Execution Protocol
1. Establish macro-whitespace first (`py-24` or `py-32`)
2. Constrain content to `max-w-4xl` or `max-w-5xl`
3. Apply typographic hierarchy and monochromatic colors
4. Every border: `1px solid #EAEAEA`
5. Add scroll-entry animations to all major blocks
6. Add visual depth through imagery or ambient gradients
