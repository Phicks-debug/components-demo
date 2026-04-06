import DemoLayout from "@/components/DemoLayout"
import ParticleGlobe from "@/components/ParticleGlobe"
import sourceCode from "@/components/ParticleGlobe.jsx?raw"
import { useState } from "react"

const defaults = {
  particleCount: 8000,
  repelRadius: 90,
  repelStrength: 28,
  speed: 1,
  color: "#ffffff",
}

export default function ParticleGlobeDemo() {
  const [params, setParams] = useState(defaults)

  const update = (key, value) =>
    setParams((prev) => ({ ...prev, [key]: value }))

  return (
    <DemoLayout
      title="Particle Globe"
      description="A rotating sphere-like cloud of particles that scatters and reforms around the cursor."
      sourceCode={sourceCode}
      sourceUrl="https://openprocessing.org/sketch/2812705"
      controls={
        <div className="mt-6 space-y-4 px-1">
          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Particles</span>
            <input
              type="range"
              min={1000}
              max={15000}
              step={500}
              value={params.particleCount}
              onChange={(e) => update("particleCount", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.particleCount}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Repel Radius</span>
            <input
              type="range"
              min={30}
              max={200}
              step={5}
              value={params.repelRadius}
              onChange={(e) => update("repelRadius", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.repelRadius}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Repel Force</span>
            <input
              type="range"
              min={5}
              max={60}
              step={1}
              value={params.repelStrength}
              onChange={(e) => update("repelStrength", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.repelStrength}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Speed</span>
            <input
              type="range"
              min={0.1}
              max={5}
              step={0.1}
              value={params.speed}
              onChange={(e) => update("speed", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.speed.toFixed(1)}</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Color</span>
            <input
              type="color"
              value={params.color}
              onChange={(e) => update("color", e.target.value)}
              className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent"
            />
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
      <ParticleGlobe
        particleCount={params.particleCount}
        repelRadius={params.repelRadius}
        repelStrength={params.repelStrength}
        speed={params.speed}
        color={params.color}
        className="aspect-video"
      />
    </DemoLayout>
  )
}
