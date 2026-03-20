---
name: redesign-existing-projects
description: Upgrades existing websites and apps to premium quality. Audits current design, identifies generic AI patterns, and applies high-end design standards without breaking functionality. Works with any CSS framework or vanilla CSS.
---

# Redesign Skill

## How This Works

1. **Scan** — Read the codebase. Identify framework, styling method, current design patterns.
2. **Diagnose** — Run through the audit below. List every generic pattern and weak point.
3. **Fix** — Apply targeted upgrades working with the existing stack. Do not rewrite from scratch.

## Design Audit Checklist

### Typography

- Browser default fonts or Inter everywhere? Replace with `Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi`.
- Headlines lack presence? Increase size, tighten letter-spacing, reduce line-height.
- Body text too wide? Limit to ~65 characters. Increase line-height.
- Only Regular/Bold weights? Introduce Medium (500) and SemiBold (600).
- Numbers in proportional font? Use monospace or tabular figures.

### Color and Surfaces

- Pure `#000000`? Replace with off-black or tinted dark.
- Oversaturated accents? Keep saturation < 80%.
- More than one accent? Pick one, remove the rest.
- "AI Purple/Blue" gradient aesthetic? Replace with neutral bases + single accent.
- Generic `box-shadow`? Tint shadows to match background hue.
- Random dark sections in light mode page? Keep consistent tone.

### Layout

- Everything centered/symmetrical? Break with offset margins, mixed ratios.
- Three equal card columns? Replace with zig-zag, asymmetric grid, or masonry.
- `height: 100vh`? Replace with `min-height: 100dvh`.
- No max-width container? Add ~1200-1440px constraint.

### Interactivity and States

- No hover states? Add background shift, scale, or translate.
- No active/pressed feedback? Add `scale(0.98)`.
- Missing loading states? Use skeleton loaders.
- No empty states? Design "getting started" views.
- No error states? Add inline error messages.

### Content

- Generic names ("John Doe")? Use diverse, realistic names.
- Fake round numbers? Use organic data (`47.2%`).
- AI copywriting cliches? Write plain, specific language.
- Lorem Ipsum? Write real draft copy.

### Component Patterns

- Generic card look? Remove border or use only spacing.
- 3-card carousel testimonials? Replace with masonry wall or embedded posts.
- Modals for everything? Use inline editing or slide-over panels.

## Fix Priority (Maximum Impact, Minimum Risk)

1. Font swap
2. Color palette cleanup
3. Hover and active states
4. Layout and spacing
5. Replace generic components
6. Add loading, empty, error states
7. Polish typography scale

## Rules

- Work with the existing tech stack. Do not migrate.
- Do not break existing functionality.
- Check `package.json` before importing new libraries.
- Keep changes reviewable and focused.
