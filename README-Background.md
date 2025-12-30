# Smartking's Arena - Animated Background System

## Overview
A high-performance, dark futuristic arena background for "Smartking's Arena". Designed for a competitive mobile gaming and esports atmosphere with smooth flowing neon waves and minimal distractions.

### Visual Specifications
- **Theme:** Dark Cyberpunk / Esports Arena.
- **Palette:** Nearly Black base (`#020617`), Neon Purple (`#A855F7`), Electric Blue (`#3B82F6`), and Cyan (`#06B6D4`).
- **Elements:**
  - **Neon Waves:** Smooth flowing SVG gradients at the bottom edges.
  - **Light Streaks:** Thin horizontal lines mimicking high-speed arena lighting.
  - **Energy Sparks:** Drifting glowing particles with soft depth.
  - **Vignette:** Strong central focus with darker center for UI legibility.
  - **Arena Grit:** Subtle noise texture overlay for a professional matte finish.

## Implementation Details
The background is a global component: `src/components/layout/AnimatedBackground.tsx`.

### Core Features
1. **Adaptive Motion:** Optimized 15-25s loop cycles for ambient motion that doesn't distract.
2. **Hydration Safe:** Particle generation is deferred to the client-side to prevent SSR mismatches.
3. **Layered Depth:** Multi-layered SVG and CSS gradients create a sense of scale.
4. **Vignette Protection:** Uses a `radial-gradient` to ensure the center interaction area remains clean.

## Accessibility (Reduced Motion)
The system respects the `prefers-reduced-motion` media query.

### Reduced Motion Behavior:
- Disables all active wave and streak animations.
- Replaces drifting particles with a static subset of faint glowing dots.
- Uses a simplified static radial gradient base.
- Maintains the dark atmosphere and vignette for legibility.

### How to Test:
1. **Browser DevTools:** 
   - Open DevTools (`F12`).
   - `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac).
   - Type "Reduced Motion" and select "Emulate CSS prefers-reduced-motion: reduce".

## Component Location
- `src/components/layout/AnimatedBackground.tsx`: Logic and styling.
