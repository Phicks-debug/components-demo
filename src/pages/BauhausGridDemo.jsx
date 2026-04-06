import DemoLayout from "@/components/DemoLayout"
import BauhausGrid, { PALETTES } from "@/components/BauhausGrid"
import sourceCode from "@/components/BauhausGrid.jsx?raw"
import { useState } from "react"

const defaults = {
  paletteIndex: 0,
  gridSize: 15,
  speed: 0.2,
  flipInterval: 150,
}

export default function BauhausGridDemo() {
  const [params, setParams] = useState(defaults)

  const update = (key, value) =>
    setParams((prev) => ({ ...prev, [key]: value }))

  return (
    <DemoLayout
      title="Bauhaus Grid"
      description="Order and disorder — a Bauhaus-inspired grid of animated semicircles driven by a binary counter."
      sourceCode={sourceCode}
      sourceUrl="https://openprocessing.org/sketch/2845065"
      controls={
        <div className="mt-6 space-y-4 px-1">
          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-muted-foreground">Palette</span>
            <div className="flex flex-wrap gap-1.5">
              {PALETTES.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => update("paletteIndex", i)}
                  title={p.label}
                  className={`flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs transition-colors ${
                    params.paletteIndex === i
                      ? "border-foreground/40 bg-foreground/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  }`}
                >
                  <span className="inline-flex gap-0.5">
                    <span className="h-3 w-3 rounded-sm" style={{ background: p.c1 }} />
                    <span className="h-3 w-3 rounded-sm" style={{ background: p.c2 }} />
                  </span>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Grid Size</span>
            <input
              type="range"
              min={7}
              max={25}
              step={2}
              value={params.gridSize}
              onChange={(e) => update("gridSize", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.gridSize}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Speed</span>
            <input
              type="range"
              min={0.02}
              max={0.5}
              step={0.02}
              value={params.speed}
              onChange={(e) => update("speed", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.speed.toFixed(2)}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Flip Interval</span>
            <input
              type="range"
              min={50}
              max={400}
              step={10}
              value={params.flipInterval}
              onChange={(e) => update("flipInterval", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.flipInterval}</span>
          </label>

          <button
            onClick={() => setParams(defaults)}
            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Reset
          </button>
        </div>
      }
    >
      <BauhausGrid
        paletteIndex={params.paletteIndex}
        gridSize={params.gridSize}
        speed={params.speed}
        flipInterval={params.flipInterval}
        className="aspect-square"
      />
    </DemoLayout>
  )
}
