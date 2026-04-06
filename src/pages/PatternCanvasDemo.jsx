import { useState } from "react"
import PatternCanvas from "@/components/PatternCanvas"
import DemoLayout from "@/components/DemoLayout"
import sourceCode from "@/components/PatternCanvas.jsx?raw"

const PATTERNS = ["grid", "dots", "crosses", "checkerboard", "waves", "diagonal"]

const defaults = {
  pattern: "grid",
  tileSize: 40,
  strokeWeight: 1,
  strokeColor: "#3b82f6",
  bgColor: "#ffffff",
}

const sliders = [
  { key: "tileSize", label: "Tile Size", min: 10, max: 120, step: 1 },
  { key: "strokeWeight", label: "Stroke Weight", min: 0.5, max: 4, step: 0.5 },
]

export default function PatternCanvasDemo() {
  const [props, setProps] = useState(defaults)

  const update = (key, value) =>
    setProps((prev) => ({ ...prev, [key]: value }))

  return (
    <DemoLayout
      title="Pattern Canvas"
      description="Infinitely tiling pattern canvas with zoom and pan. Scroll to scale, drag to pan — like applying a texture to a mesh."
      sourceCode={sourceCode}
      controls={
        <div className="mt-6 space-y-4 px-1">
          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-muted-foreground">Pattern</span>
            <div className="flex flex-wrap gap-1.5">
              {PATTERNS.map((p) => (
                <button
                  key={p}
                  onClick={() => update("pattern", p)}
                  className={`rounded-md border px-2.5 py-1 text-xs capitalize transition-colors ${
                    props.pattern === p
                      ? "border-foreground/40 bg-foreground/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Stroke
              <input
                type="color"
                value={props.strokeColor}
                onChange={(e) => update("strokeColor", e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Background
              <input
                type="color"
                value={props.bgColor}
                onChange={(e) => update("bgColor", e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent"
              />
            </label>
          </div>

          {sliders.map(({ key, label, min, max, step }) => (
            <label key={key} className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="w-24 shrink-0">{label}</span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={props[key]}
                onChange={(e) => update(key, parseFloat(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
              />
              <span className="w-10 text-right font-mono tabular-nums">
                {props[key]}
              </span>
            </label>
          ))}

          <button
            onClick={() => setProps(defaults)}
            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Reset
          </button>
        </div>
      }
    >
      <div className="aspect-square w-full">
        <PatternCanvas
          pattern={props.pattern}
          tileSize={props.tileSize}
          strokeColor={props.strokeColor}
          strokeWeight={props.strokeWeight}
          bgColor={props.bgColor}
        />
      </div>
    </DemoLayout>
  )
}
