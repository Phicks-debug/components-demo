import { Link } from "react-router-dom"

const components = [
  {
    title: "OpenAI Wave Gradient",
    description:
      "WebGL2 animated wave gradient with configurable color themes. Inspired by OpenAI's visual style.",
    path: "/openai-wave-gradient",
  },
]

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Components</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Reusable components for future projects. Copy the code and modify
        parameters.
      </p>

      <div className="mt-8 grid gap-3">
        {components.map((c) => (
          <Link
            key={c.path}
            to={c.path}
            className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
          >
            <p className="text-sm font-medium">{c.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {c.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
