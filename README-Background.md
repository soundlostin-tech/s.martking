# Smartking's Arena - Animated Background System

## Overview
A subtle, brand-aligned full-screen animated background implemented using React and Framer Motion for maximum performance and accessibility.

### Visual Specifications
- **Palette:** Deep Navy (`#0f172a`), Slate (`#111827`), Accent Gold (`#FFD24D`), Warm Orange (`#FF7A18`).
- **Elements:** Parallax waves, glowing particle drift, and a central vignette.
- **Tempo:** Slow 18s loop for the background gradient and primary wave.
- **Legibility:** 0.12 opacity dimming overlay ensures foreground UI remains WCAG AA compliant.

## Implementation Details
The background is implemented as a React component: `src/components/ui/AnimatedBackground.tsx`.

### Features
1. **Dynamic Gradients:** Slow-moving radial gradients create depth.
2. **Parallax Waves:** Multi-layered SVG waves moving at different speeds.
3. **Particle System:** Lightweight DOM-based particles with blur effects.
4. **Vignette:** Radial gradient overlay to focus the viewer's attention.

## Accessibility (Reduced Motion)
The system automatically detects user preferences for reduced motion via the `prefers-reduced-motion` media query (using Framer Motion's `useReducedMotion` hook).

### How to Toggle/Test:
1. **Windows:** Settings > Accessibility > Visual Effects > Show animation in Windows (Toggle Off).
2. **macOS:** System Settings > Accessibility > Display > Reduce motion (Toggle On).
3. **Browser DevTools:** 
   - Open Chrome DevTools (`F12`).
   - Press `Ctrl+Shift+P`.
   - Type "Reduced Motion" and select "Emulate CSS prefers-reduced-motion: reduce".

**Reduced Motion Version Behavior:**
- Switches to a static radial gradient.
- Disables all wave animations.
- Reduces particle count and removes movement/pulsing.
- Maintains the 0.12 dimming overlay for legibility.

## Files
- `src/components/ui/AnimatedBackground.tsx`: Main component.
- `public/background-assets.svg`: Static source layers for designers.
