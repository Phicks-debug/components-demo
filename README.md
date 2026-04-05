# Components Demo

Reusable React component library built with Vite, React 19, and Tailwind CSS v4. A reference collection of components that can be copied into future projects and customized.

## Goal

Build a collection of self-contained, visually polished components that serve as a reference library. Each component is designed to be copied into any project with minimal modification — just adjust the parameters to fit your needs.

## Components

### OpenAI Wave Gradient

WebGL2-powered animated gradient with flowing wave effects. Configurable color themes and animation speed.

**Props:**

- `colors` — `{ main, low, mid, high }` where each is `[r, g, b]` (0-1 floats)
- `speed` — Animation speed multiplier (default: 1)
- `className` — CSS classes for the canvas element

**Built-in themes:** orange, blue, purple, green, crimson

## Stack

- **Runtime/Package Manager:** Bun
- **Framework:** React 19
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite` plugin)

## Commands

- `bun run dev` — Start dev server
- `bun run build` — Production build
- `bun run preview` — Preview production build
- `bun run lint` — Run ESLint
