import DemoLayout from "@/components/DemoLayout"
import BezierFlow from "@/components/BezierFlow"
import sourceCode from "@/components/BezierFlow.jsx?raw"
import { useState } from "react"

const defaults = {
  curveCount: 3000,
  speed: 1,
  strokeColor: "#000066",
  strokeAlpha: 50,
  backgroundColor: "#f5f5f5",
  spread: 50,
  amplitude: 500,
  thickness: 0.008,
}

export default function BezierFlowDemo() {
  const [params, setParams] = useState(defaults)

  const update = (key, value) => setParams((p) => ({ ...p, [key]: value }))

  return (
    <DemoLayout
      title="Bezier Flow"
      description="Flowing field of animated bezier curves with oscillating control points."
      sourceCode={sourceCode}
      controls={
        <div className="mt-6 space-y-4 px-1">
          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Curves</span>
            <input
              type="range"
              min={500}
              max={5000}
              step={100}
              value={params.curveCount}
              onChange={(e) => update("curveCount", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.curveCount}</span>
          </label>
          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Speed</span>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.1}
              value={params.speed}
              onChange={(e) => update("speed", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.speed.toFixed(1)}</span>
          </label>
          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Opacity</span>
            <input
              type="range"
              min={10}
              max={150}
              step={5}
              value={params.strokeAlpha}
              onChange={(e) => update("strokeAlpha", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.strokeAlpha}</span>
          </label>
          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Spread</span>
            <input
              type="range"
              min={10}
              max={200}
              step={5}
              value={params.spread}
              onChange={(e) => update("spread", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.spread}</span>
          </label>
          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Amplitude</span>
            <input
              type="range"
              min={100}
              max={1000}
              step={50}
              value={params.amplitude}
              onChange={(e) => update("amplitude", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.amplitude}</span>
          </label>
          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Thickness</span>
            <input
              type="range"
              min={0.002}
              max={0.03}
              step={0.001}
              value={params.thickness}
              onChange={(e) => update("thickness", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.thickness.toFixed(3)}</span>
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Stroke</span>
              <input
                type="color"
                value={params.strokeColor}
                onChange={(e) => update("strokeColor", e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Background</span>
              <input
                type="color"
                value={params.backgroundColor}
                onChange={(e) => update("backgroundColor", e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent"
              />
            </label>
            <button
              onClick={() => setParams(defaults)}
              className="ml-auto rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Reset
            </button>
          </div>
        </div>
      }
    >
      <BezierFlow
        curveCount={params.curveCount}
        speed={params.speed}
        strokeColor={params.strokeColor}
        strokeAlpha={params.strokeAlpha}
        backgroundColor={params.backgroundColor}
        spread={params.spread}
        amplitude={params.amplitude}
        thickness={params.thickness}
        className="aspect-video"
      />
    </DemoLayout>
  )
}
