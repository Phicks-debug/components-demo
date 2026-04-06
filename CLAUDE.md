# Components Demo

React component showcase built with Vite, React 19, and Tailwind CSS v4.

## Stack

- **Runtime/Package Manager:** Bun
- **Framework:** React 19
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- **Linting:** ESLint 9

## Commands

- `bun run dev` — Start dev server
- `bun run build` — Production build
- `bun run preview` — Preview production build
- `bun run lint` — Run ESLint

## Conventions

- Use Bun, not npm/yarn/pnpm
- Use Tailwind utility classes for styling; avoid custom CSS unless necessary
- Components go in `src/components/`
- Demo pages must use `DemoLayout` from `src/components/DemoLayout.jsx` (provides back button, title, description, copy code button, and component boundary)
- Import component source with `?raw` suffix for the copy code feature (e.g. `import sourceCode from "@/components/Foo.jsx?raw"`)
- Demo controls/parameters must use the `controls` prop on `DemoLayout` (renders below the component view), never inside the component preview area
- Demo control UI must follow the established patterns — do NOT invent new layouts:
  - Controls wrapper: `<div className="mt-6 space-y-4 px-1">`
  - Range sliders: inline flex label — `<label className="flex items-center gap-3 text-xs text-muted-foreground">` with `<span className="w-24 shrink-0">` for label, `className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"` for input, `<span className="w-10 text-right font-mono tabular-nums">` for value
  - Toggle buttons: `<div className="flex items-center gap-3">` with label span, then `<div className="flex flex-wrap gap-1.5">` for buttons. Active: `border-foreground/40 bg-foreground/10 text-foreground`. Inactive: `border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground`
  - Color inputs: inline with label — `<label className="flex items-center gap-2 text-xs text-muted-foreground">` with `className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent"` for input
  - Reset/action buttons: `className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"`
  - Use a `defaults` object + `update(key, value)` helper for state management when there are multiple parameters

Tips to build a best website:

- You landing page does not need: bento boxes, feature, benefits, social proof, how it works, pricing, faq. Your landing page needs storytelling. A good and clean storytelling can deliver more impact.
