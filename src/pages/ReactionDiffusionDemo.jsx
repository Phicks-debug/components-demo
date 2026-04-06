import DemoLayout from "@/components/DemoLayout"
import ReactionDiffusion from "@/components/ReactionDiffusion"
import sourceCode from "@/components/ReactionDiffusion.jsx?raw"
import { useState } from "react"

const defaults = { radius: 7, sharpness: 64, blend: 0.5, fontSize: 86 }

export default function ReactionDiffusionDemo() {
  const [params, setParams] = useState(defaults)
  const [clearTrigger, setClearTrigger] = useState(0)
  const update = (key, value) => setParams((p) => ({ ...p, [key]: value }))

  return (
    <DemoLayout
      title="Reaction Diffusion"
      description="Type text that dissolves into organic patterns via blur + unsharp mask feedback. Click to position cursor, type to add text. Backspace to clear, / to toggle color."
      sourceCode={sourceCode}
      sourceUrl="https://openprocessing.org/sketch/2752204"
      controls={
        <div className="mt-6 space-y-4 px-1">
          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Radius</span>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={params.radius}
              onChange={(e) => update("radius", +e.target.value)}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.radius.toFixed(1)}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Sharpness</span>
            <input
              type="range"
              min="1"
              max="128"
              step="1"
              value={params.sharpness}
              onChange={(e) => update("sharpness", +e.target.value)}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.sharpness}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Blend</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={params.blend}
              onChange={(e) => update("blend", +e.target.value)}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.blend.toFixed(2)}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Font Size</span>
            <input
              type="range"
              min="20"
              max="150"
              step="2"
              value={params.fontSize}
              onChange={(e) => update("fontSize", +e.target.value)}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.fontSize}</span>
          </label>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setClearTrigger((t) => t + 1)}
              className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Clear
            </button>
            <button
              onClick={() => setParams(defaults)}
              className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Reset
            </button>
          </div>
        </div>
      }
    >
      <ReactionDiffusion
        radius={params.radius}
        sharpness={params.sharpness}
        blend={params.blend}
        fontSize={params.fontSize}
        clearTrigger={clearTrigger}
        className="aspect-square"
      />
    </DemoLayout>
  )
}
