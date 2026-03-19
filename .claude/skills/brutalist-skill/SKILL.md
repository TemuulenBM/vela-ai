---
name: industrial-brutalist-ui
description: Raw mechanical interfaces fusing Swiss typographic print with military terminal aesthetics. Rigid grids, extreme type scale contrast, utilitarian color, analog degradation effects. For data-heavy dashboards, portfolios, or editorial sites.
---

# SKILL: Industrial Brutalism & Tactical Telemetry UI

## 1. Skill Meta
Architecting web interfaces that synthesize mid-century Swiss Typographic design, industrial manufacturing manuals, and retro-futuristic aerospace/military terminal interfaces.

## 2. Visual Archetypes (Pick ONE per project)

### 2.1 Swiss Industrial Print
Light mode. High-contrast. Monolithic heavy sans-serif. Unforgiving structural grids. Oversized viewport-bleeding numerals. Primary red accent.

### 2.2 Tactical Telemetry & CRT Terminal
Dark mode exclusive. High-density tabular data. Absolute monospace dominance. ASCII brackets, crosshairs. Simulated phosphor glow, scanlines.

## 3. Typographic Architecture

### Macro-Typography (Headers)
- Fonts: Neue Haas Grotesk (Black), Archivo Black, Monument Extended
- Scale: `clamp(4rem, 10vw, 15rem)`. Tracking: `-0.03em` to `-0.06em`. Leading: `0.85`-`0.95`. Uppercase.

### Micro-Typography (Data)
- Fonts: JetBrains Mono, IBM Plex Mono, Space Mono
- Scale: `10px`-`14px`. Tracking: `0.05em`-`0.1em`. Uppercase.

### Textural Contrast (Sparse)
- Fonts: Playfair Display, EB Garamond. Subject to halftone/dithering degradation.

## 4. Color System
No gradients, soft shadows, or translucency.

### Swiss Print (Light):
- Background: `#F4F4F0`. Foreground: `#050505`. Accent: `#E61919` (Aviation Red only).

### Tactical (Dark):
- Background: `#0A0A0A`. Foreground: `#EAEAEA`. Accent: `#E61919`. Optional terminal green `#4AF626` for single element only.

## 5. Layout
- Strict CSS Grid. Elements anchored to grid tracks.
- Solid borders (`1px`-`2px`) to delineate zones. Full-width `<hr>` separators.
- Oscillate between extreme data density and vast negative space.
- **Zero border-radius.** All corners 90 degrees.

## 6. UI Components
- ASCII framing: `[ DELIVERY SYSTEMS ]`, `< RE-IND >`, `>>>`, `///`
- Registration marks (R), copyright (C), trademark (TM) as structural elements.
- Crosshairs (+) at grid intersections. Barcode patterns. Warning stripes.

## 7. Textural Effects
- Halftone/1-bit dithering on images and serif typography.
- CRT scanlines via `repeating-linear-gradient`.
- Global low-opacity SVG noise filter.

## 8. Engineering Directives
1. Use `display: grid; gap: 1px;` with contrasting backgrounds for dividing lines.
2. Semantic tags: `<data>`, `<samp>`, `<kbd>`, `<output>`, `<dl>`.
3. CSS `clamp()` for macro-typography scaling.
