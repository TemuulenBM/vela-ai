---
name: design-taste-frontend
description: Senior UI/UX Engineer. Architect digital interfaces overriding default LLM biases. Enforces metric-based rules, strict component architecture, CSS hardware acceleration, and balanced design engineering.
---

# High-Agency Frontend Skill

## 1. ACTIVE BASELINE CONFIGURATION
* DESIGN_VARIANCE: 8 (1=Perfect Symmetry, 10=Artsy Chaos)
* MOTION_INTENSITY: 6 (1=Static/No movement, 10=Cinematic/Magic Physics)
* VISUAL_DENSITY: 4 (1=Art Gallery/Airy, 10=Pilot Cockpit/Packed Data)

**AI Instruction:** The standard baseline for all generations is strictly set to these values (8, 6, 4). Do not ask the user to edit this file. Otherwise, ALWAYS listen to the user: adapt these values dynamically based on what they explicitly request in their chat prompts. Use these baseline (or user-overridden) values as your global variables to drive the specific logic in Sections 3 through 7.

## 2. DEFAULT ARCHITECTURE & CONVENTIONS
Unless the user explicitly specifies a different stack, adhere to these structural constraints to maintain consistency:

* **DEPENDENCY VERIFICATION [MANDATORY]:** Before importing ANY 3rd party library (e.g. `framer-motion`, `lucide-react`, `zustand`), you MUST check `package.json`. If the package is missing, you MUST output the installation command (e.g. `npm install package-name`) before providing the code. **Never** assume a library exists.
* **Framework & Interactivity:** React or Next.js. Default to Server Components (`RSC`).
    * **RSC SAFETY:** Global state works ONLY in Client Components. In Next.js, wrap providers in a `"use client"` component.
    * **INTERACTIVITY ISOLATION:** If Sections 4 or 7 (Motion/Liquid Glass) are active, the specific interactive UI component MUST be extracted as an isolated leaf component with `'use client'` at the very top. Server Components must exclusively render static layouts.
* **State Management:** Use local `useState`/`useReducer` for isolated UI. Use global state strictly for deep prop-drilling avoidance.
* **Styling Policy:** Use Tailwind CSS (v3/v4) for 90% of styling.
    * **TAILWIND VERSION LOCK:** Check `package.json` first. Do not use v4 syntax in v3 projects.
    * **T4 CONFIG GUARD:** For v4, do NOT use `tailwindcss` plugin in `postcss.config.js`. Use `@tailwindcss/postcss` or the Vite plugin.
* **ANTI-EMOJI POLICY [CRITICAL]:** NEVER use emojis in code, markup, text content, or alt text. Replace symbols with high-quality icons (Radix, Phosphor) or clean SVG primitives. Emojis are BANNED.
* **Responsiveness & Spacing:**
  * Standardize breakpoints (`sm`, `md`, `lg`, `xl`).
  * Contain page layouts using `max-w-[1400px] mx-auto` or `max-w-7xl`.
  * **Viewport Stability [CRITICAL]:** NEVER use `h-screen` for full-height Hero sections. ALWAYS use `min-h-[100dvh]` to prevent catastrophic layout jumping on mobile browsers (iOS Safari).
  * **Grid over Flex-Math:** NEVER use complex flexbox percentage math (`w-[calc(33%-1rem)]`). ALWAYS use CSS Grid (`grid grid-cols-1 md:grid-cols-3 gap-6`) for reliable structures.
* **Icons:** You MUST use exactly `@phosphor-icons/react` or `@radix-ui/react-icons` as the import paths (check installed version). Standardize `strokeWidth` globally (e.g., exclusively use `1.5` or `2.0`).

## 3. DESIGN ENGINEERING DIRECTIVES (Bias Correction)

**Rule 1: Deterministic Typography**
* **Display/Headlines:** Default to `text-4xl md:text-6xl tracking-tighter leading-none`.
    * **ANTI-SLOP:** Discourage `Inter` for "Premium" or "Creative" vibes. Force unique character using `Geist`, `Outfit`, `Cabinet Grotesk`, or `Satoshi`.
    * **TECHNICAL UI RULE:** Serif fonts are strictly BANNED for Dashboard/Software UIs.
* **Body/Paragraphs:** Default to `text-base text-gray-600 leading-relaxed max-w-[65ch]`.

**Rule 2: Color Calibration**
* **Constraint:** Max 1 Accent Color. Saturation < 80%.
* **THE LILA BAN:** The "AI Purple/Blue" aesthetic is strictly BANNED. Use absolute neutral bases (Zinc/Slate) with high-contrast, singular accents.
* **COLOR CONSISTENCY:** Stick to one palette for the entire output.

**Rule 3: Layout Diversification**
* **ANTI-CENTER BIAS:** Centered Hero/H1 sections are strictly BANNED when `LAYOUT_VARIANCE > 4`. Force asymmetric structures.

**Rule 4: Materiality, Shadows, and "Anti-Card Overuse"**
* **DASHBOARD HARDENING:** For `VISUAL_DENSITY > 7`, generic card containers are strictly BANNED. Use `border-t`, `divide-y`, or negative space.
* Use cards ONLY when elevation communicates hierarchy. Tint shadows to the background hue.

**Rule 5: Interactive UI States**
* **Mandatory Generation:** Implement full interaction cycles: Loading (skeletal loaders), Empty States, Error States, Tactile Feedback (`-translate-y-[1px]` or `scale-[0.98]`).

**Rule 6: Data & Form Patterns**
* **Forms:** Label MUST sit above input. Error text below input. Use `gap-2` for input blocks.

## 4. CREATIVE PROACTIVITY (Anti-Slop Implementation)
* **"Liquid Glass" Refraction:** Add 1px inner border (`border-white/10`) and inner shadow for physical edge refraction.
* **Magnetic Micro-physics (If MOTION_INTENSITY > 5):** Use EXCLUSIVELY Framer Motion's `useMotionValue` and `useTransform` outside React render cycle.
* **Perpetual Micro-Interactions:** When `MOTION_INTENSITY > 5`, embed continuous micro-animations. Apply Spring Physics (`type: "spring", stiffness: 100, damping: 20`).
* **Layout Transitions:** Utilize Framer Motion's `layout` and `layoutId` props.
* **Staggered Orchestration:** Use `staggerChildren` or CSS cascade for sequential reveals.

## 5. PERFORMANCE GUARDRAILS
* Apply grain/noise filters exclusively to fixed, pointer-event-none pseudo-elements.
* Never animate `top`, `left`, `width`, or `height`. Animate exclusively via `transform` and `opacity`.
* NEVER spam arbitrary z-indexes. Use strictly for systemic layer contexts.

## 6. TECHNICAL REFERENCE (Dial Definitions)

### DESIGN_VARIANCE (Level 1-10)
* **1-3:** Flexbox center, strict 12-column symmetrical grids.
* **4-7:** Overlapping margins, varied aspect ratios, left-aligned headers.
* **8-10:** Masonry layouts, CSS Grid fractional units, massive empty zones.
* **MOBILE OVERRIDE:** For levels 4-10, fall back to single-column on `< 768px`.

### MOTION_INTENSITY (Level 1-10)
* **1-3:** No automatic animations. CSS hover/active only.
* **4-7:** CSS transitions with cubic-bezier. `animation-delay` cascades.
* **8-10:** Scroll-triggered reveals, parallax. Framer Motion hooks. NEVER use `window.addEventListener('scroll')`.

### VISUAL_DENSITY (Level 1-10)
* **1-3:** Art Gallery Mode. Huge section gaps.
* **4-7:** Normal spacing for standard web apps.
* **8-10:** Cockpit Mode. Tiny paddings. Monospace for all numbers.

## 7. AI TELLS (Forbidden Patterns)

### Visual & CSS
* NO Neon/Outer Glows, NO Pure Black (#000000), NO Oversaturated Accents, NO Excessive Gradient Text, NO Custom Mouse Cursors.

### Typography
* NO Inter Font. NO Oversized H1s. Serif ONLY for creative/editorial.

### Layout & Spacing
* NO 3-Column Card Layouts (BANNED). Use zig-zag, asymmetric grid, or horizontal scroll.

### Content & Data
* NO Generic Names ("John Doe"). NO Fake Numbers ("99.99%"). NO Startup Slop Names ("Acme"). NO Filler Words ("Elevate", "Seamless").

### External Resources
* NO Broken Unsplash Links. Use `https://picsum.photos/seed/{random}/800/600`.
* shadcn/ui: MUST customize radii, colors, shadows. Never use defaults.

## 8. THE CREATIVE ARSENAL (High-End Inspiration)
Pull from this library: Mac OS Dock Magnification, Magnetic Buttons, Gooey Menus, Dynamic Islands, Bento Grids, Masonry Layouts, Parallax Tilt Cards, Spotlight Border Cards, Glassmorphism Panels, Holographic Foil Cards, Sticky Scroll Stacks, Horizontal Scroll Hijack, Kinetic Marquees, Text Mask Reveals, Particle Explosion Buttons, Mesh Gradient Backgrounds, and more.

## 9. THE "MOTION-ENGINE" BENTO PARADIGM
For modern SaaS dashboards or feature sections:
* **Aesthetic:** Background `#f9fafb`. Cards pure white with 1px `border-slate-200/50`. `rounded-[2.5rem]`.
* **Typography:** `Geist`, `Satoshi`, or `Cabinet Grotesk`. Tight tracking for headers.
* **Animation Engine:** Spring Physics, Layout Transitions, Infinite Loops, `<AnimatePresence>`.
* **5-Card Archetypes:** Intelligent List (auto-sorting), Command Input (typewriter), Live Status (breathing indicators), Wide Data Stream (infinite carousel), Contextual UI (focus mode).

## 10. FINAL PRE-FLIGHT CHECK
- [ ] Mobile layout collapse guaranteed for high-variance designs?
- [ ] Full-height sections use `min-h-[100dvh]`?
- [ ] `useEffect` animations contain cleanup functions?
- [ ] Empty, loading, and error states provided?
- [ ] Cards omitted in favor of spacing where possible?
- [ ] CPU-heavy animations isolated in their own Client Components?
