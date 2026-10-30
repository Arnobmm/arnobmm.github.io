# Implementation Plan: Ragdoll Escape Integration & Project Cards Condensation

Integrate the user's provided **Ragdoll Escape** 2D physics platformer adventure game into the portfolio website as a featured highlight in the Games category with full interactive gameplay, and streamline all project card descriptions in the project showcase into crisp 2-line condensed summaries with automatic truncation to eliminate visual text bloat.

## Proposed Changes

### 1. Project Cards Description Optimization (`src/data/projects.ts` & `src/components/ProjectShowcase.tsx`)
- **Problem**: Current project cards contain dense 3–4 sentence paragraphs in `description`, resulting in excessive vertical text bulk and unbalanced card heights in the Bento showcase grid.
- **Solution**:
  - Rewrite every project's `description` field in `src/data/projects.ts` to be a punchy, engaging 1-to-2 sentence summary (under 20 words) focused strictly on what it is and what makes it special.
  - Preserve all rich, detailed technical breakdowns, architecture notes, and features in `longDescription` and `features` arrays for the full project detail pages (`ProjectDetail.tsx`).
  - Update `ProjectShowcase.tsx` description typography to enforce `line-clamp-2 leading-relaxed text-sm text-slate-300`, ensuring clean visual alignment across all cards regardless of screen width.

### 2. "Ragdoll Escape" Game Integration (`src/data/projects.ts` & `src/components/demos/RagdollEscapeDemo.tsx`)
- **Game Assets & Features**:
  - Embed the complete standalone 2D physics platformer engine (`/public/assets/aistudio/ragdoll_escape_2d_physics_platformer_adventure_5ddc9cff.html`) featuring:
    - 12 levels across 4 atmospheric worlds (Abandoned Lab, Industrial Plant, Neon Rooftops, Escape Portal).
    - Verlet integration articulated humanoid ragdoll with 11 rigid-rod constraint bones and head/torso collision circles.
    - Dynamic physical props (pushable crates, pressure switches, toggling laser barriers, swing ropes, seesaw catapults).
    - Full synth audio engine, 36 golden bolts, 12 hidden gems, 8 unlockable skins, and on-screen touch overlay for mobile devices.
- **Component Implementation**:
  - Create `src/components/demos/RagdollEscapeDemo.tsx` supporting:
    - Seamless embedded gameplay within `ProjectDetail.tsx` (aspect-ratio preserved container).
    - Fullscreen toggle button with keyboard shortcut (`F` or `ESC` to exit).
    - Sound toggle and responsive touch-control integration for PC and mobile devices.
    - Quick-restart and level selection helpers.
- **Project Metadata**:
  - Add `ragdoll-escape` into `src/data/projects.ts`:
    - Category: `game` (marked `featured: true` within the Games filter).
    - Accent colors: Electric Cyan & Vibrant Lime (`theme: 'cyan'`).
    - Demo type: `'ragdoll-escape'`.
    - Short description: *"Physics-driven 2D platformer adventure featuring an articulated ragdoll, dynamic puzzles, and 12 escape levels."*

### 3. Route & Showcase Wiring
- Update `src/components/ProjectDetail.tsx` to handle `demoType === 'ragdoll-escape'` by rendering `<RagdollEscapeDemo />`.
- Register appropriate thematic styling and icons (`Gamepad2`, `Sparkles`) in `src/components/ProjectShowcase.tsx`.

## Verification Plan

### Automated Verification
- Run `npm run build` via `compile_applet` to verify TypeScript typings and build integrity.
- Run `lint_applet` to confirm no unused imports or syntax issues.

### Manual / Browser Verification
- Visit `https://ais-dev-wkup5c3452xqvda4ciqq7c-585643490439.asia-southeast1.run.app`.
- Inspect the Projects section:
  - Verify every project card displays a crisp, uncluttered 2-line summary with no text overflow or mismatched card sizing.
  - Verify the Games filter shows "Ragdoll Escape" as a featured highlight with custom duotone styling.
- Open the Ragdoll Escape project detail page:
  - Verify game canvas loads smoothly, controls respond to keyboard (`A`/`D`/Arrow keys, `Space`/`W` to jump/grab) and touch overlay on mobile.
  - Verify level progression, audio synthesis, and fullscreen toggle work without issues.
