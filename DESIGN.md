---
version: alpha
name: innercreate
description: The official home of Florence D'haemer's music. One dark, warm theme throughout, a serif voice for headings, and amber as the only accent. This file records the site as built; it adds no new theme.

colors:
  canvas: "#1a1612"
  canvas-alt: "#1e1814"
  surface: "#2a1f17"
  accent: "#c4956a"
  text: "#f0e6d6"
  text-muted: "#a89279"
  hairline: "rgba(255, 255, 255, 0.05 to 0.10)"
  error: "red-400"

typography:
  heading: "Cormorant Garamond (--font-serif), weights 400, 600, 700"
  body: "Inter (--font-sans)"
  control-label: "Inter, 12px, semibold, uppercase, 0.1em tracking"
---

# innercreate design notes

The tokens live in `src/app/globals.css` under `@theme`. Use the `brand-*` utilities, never new hex values.

## Colour

- The page is dark everywhere. No section flips to a light theme.
- Amber is the only accent: links on hover, button borders and fills, focus rings.
- `text-brand-gold` is the lowest contrast allowed for small text that must be read. The `/40` and `/60` tints are for
  decoration and the copyright line only.

## Controls

- Form buttons and inputs use `rounded`, `px-6 py-3` and the control label above.
- A primary action is filled amber on dark text. A choice between two equal options uses two identical outline buttons
  (amber border, amber text, filling amber on hover), so neither looks like the default.
- Every control has a visible `focus-visible` amber outline. New stand-alone controls are at least 44 px tall on a phone;
  a link inside a sentence is exempt.
- Footer and inline links are underlined with `underline-offset-2`.

## Rules carried from the owner

- No native browser dialogs.
- No coloured rail beside a card, row or section.
- Loading is shown in place in the current theme, never with a spinner or popup.
- Motion respects `prefers-reduced-motion`; `globals.css` holds the overrides.
