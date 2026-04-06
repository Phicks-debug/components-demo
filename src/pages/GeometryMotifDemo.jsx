import DemoLayout from "@/components/DemoLayout"
import GeometryMotif from "@/components/GeometryMotif"
import sourceCode from "@/components/GeometryMotif.jsx?raw"
import { useState } from "react"

const defaults = {
  elementCount: 20,
  speed: 0.5,
  oscillationSpeed: 0.01,
  ellipseDrift: 0.001,
  maxHeightRatio: 0.7,
  backgroundColor: "#f5f5f5",
  shapeColor: "#ffffff",
}

export default function GeometryMotifDemo() {
  const [params, setParams] = useState(defaults)

  const update = (key, value) =>
    setParams((prev) => ({ ...prev, [key]: value }))

  return (
    <DemoLayout
      title="Geometry Motif"
      description="Animated geometric shapes with DIFFERENCE blend mode — overlapping rectangles and ellipses create shifting inversions."
      sourceCode={sourceCode}
      sourceUrl="https://openprocessing.org/sketch/2389024"
      controls={
        <div className="mt-6 space-y-4 px-1">
          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Elements</span>
            <input
              type="range"
              min={5}
              max={50}
              step={1}
              value={params.elementCount}
              onChange={(e) => update("elementCount", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.elementCount}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Speed</span>
            <input
              type="range"
              min={0.01}
              max={1.0}
              step={0.01}
              value={params.speed}
              onChange={(e) => update("speed", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.speed.toFixed(2)}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Oscillation</span>
            <input
              type="range"
              min={0.001}
              max={0.05}
              step={0.001}
              value={params.oscillationSpeed}
              onChange={(e) => update("oscillationSpeed", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.oscillationSpeed.toFixed(3)}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Ellipse Drift</span>
            <input
              type="range"
              min={0.0001}
              max={0.01}
              step={0.0001}
              value={params.ellipseDrift}
              onChange={(e) => update("ellipseDrift", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.ellipseDrift.toFixed(4)}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Max Height</span>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={params.maxHeightRatio}
              onChange={(e) => update("maxHeightRatio", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.maxHeightRatio.toFixed(2)}</span>
          </label>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Background
              <input
                type="color"
                value={params.backgroundColor}
                onChange={(e) => update("backgroundColor", e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Shape Color
              <input
                type="color"
                value={params.shapeColor}
                onChange={(e) => update("shapeColor", e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent"
              />
            </label>
          </div>

          <button
            onClick={() => setParams(defaults)}
            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Reset
          </button>
        </div>
      }
    >
      <GeometryMotif
        elementCount={params.elementCount}
        speed={params.speed}
        oscillationSpeed={params.oscillationSpeed}
        ellipseDrift={params.ellipseDrift}
        maxHeightRatio={params.maxHeightRatio}
        backgroundColor={params.backgroundColor}
        shapeColor={params.shapeColor}
        className="aspect-square"
      />
    </DemoLayout>
  )
}
