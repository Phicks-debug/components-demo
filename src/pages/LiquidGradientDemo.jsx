import DemoLayout from "@/components/DemoLayout"
import LiquidGradient, { PALETTES } from "@/components/LiquidGradient"
import sourceCode from "@/components/LiquidGradient.jsx?raw"
import { useState } from "react"

const paletteKeys = Object.keys(PALETTES)

const defaults = {
  palette: "ocean",
  speed: 0.2,
  warp: 0.6,
  scale: 1.3,
}

export default function LiquidGradientDemo() {
  const [params, setParams] = useState(defaults)
  const update = (key, value) => setParams((p) => ({ ...p, [key]: value }))

  return (
    <DemoLayout
      title="Liquid Gradient"
      description="WebGL2 liquid gradient with domain-warped noise and iridescent color palettes."
      sourceCode={sourceCode}
      controls={
        <div className="mt-6 space-y-4 px-1">
          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-muted-foreground">Palette</span>
            <div className="flex flex-wrap gap-1.5">
              {paletteKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => update("palette", key)}
                  className={`rounded-full border px-2.5 py-1 text-xs capitalize transition-colors ${
                    params.palette === key
                      ? "border-foreground/40 bg-foreground/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Speed</span>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={params.speed}
              onChange={(e) => update("speed", parseFloat(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.speed.toFixed(1)}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Warp</span>
            <input
              type="range"
              min="0.2"
              max="3"
              step="0.1"
              value={params.warp}
              onChange={(e) => update("warp", parseFloat(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.warp.toFixed(1)}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Scale</span>
            <input
              type="range"
              min="1"
              max="6"
              step="0.1"
              value={params.scale}
              onChange={(e) => update("scale", parseFloat(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.scale.toFixed(1)}</span>
          </label>

          <div className="flex justify-end">
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
      <LiquidGradient
        palette={PALETTES[params.palette]}
        speed={params.speed}
        warp={params.warp}
        scale={params.scale}
        className="aspect-video"
      />
    </DemoLayout>
  )
}
