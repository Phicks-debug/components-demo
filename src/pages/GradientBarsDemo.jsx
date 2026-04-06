import DemoLayout from "@/components/DemoLayout"
import GradientBars from "@/components/GradientBars"
import sourceCode from "@/components/GradientBars.jsx?raw"
import { useState } from "react"

const palettes = {
  Skyspider: ["#f4b232", "#f2dbbd", "#01799c", "#e93e48", "#0b1952", "#006748", "#ed817d"],
  Mondrian: ["#EAEFE9", "#E70503", "#000591", "#FDDE06", "#050103"],
  RetroMetro: ["#ea5545", "#f46a9b", "#ef9b20", "#edbf33", "#ede15b", "#bdcf32", "#87bc45", "#27aeef", "#b33dc6"],
  Aurora: ["#98FB98", "#87CEEB", "#E6E6FA", "#40E0D0", "#9370DB", "#48D1CC", "#B0E0E6", "#98FF98", "#DDA0DD", "#00CED1"],
  Rothko: ["#E49A16", "#E19713", "#D67629", "#DA6E2E", "#D85434"],
  BlueNightclub: ["#4500fe", "#581afe", "#6a33fe", "#7d4dfe", "#8f66fe", "#a280ff", "#b599ff", "#c7b3ff", "#daccff", "#ece6ff", "#ffffff"],
}

const defaults = {
  barCount: 20,
  palette: "Skyspider",
  speed: 0.025,
  phaseShift: 0.25,
  repetitions: 2,
  shadowBlur: 10,
  backgroundColor: "#f5f5f5",
}

export default function GradientBarsDemo() {
  const [params, setParams] = useState(defaults)

  const update = (key, value) =>
    setParams((prev) => ({ ...prev, [key]: value }))

  return (
    <DemoLayout
      title="Gradient Bars"
      description="Animated vertical bars with repeating linear gradients — sine-wave phase shifting creates a flowing color wave."
      sourceCode={sourceCode}
      sourceUrl="https://openprocessing.org/sketch/2554026"
      controls={
        <div className="mt-6 space-y-4 px-1">
          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Bars</span>
            <input
              type="range"
              min={4}
              max={60}
              step={1}
              value={params.barCount}
              onChange={(e) => update("barCount", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.barCount}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Speed</span>
            <input
              type="range"
              min={0.005}
              max={0.1}
              step={0.005}
              value={params.speed}
              onChange={(e) => update("speed", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.speed.toFixed(3)}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Phase Shift</span>
            <input
              type="range"
              min={0.05}
              max={1.0}
              step={0.05}
              value={params.phaseShift}
              onChange={(e) => update("phaseShift", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.phaseShift.toFixed(2)}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Repetitions</span>
            <input
              type="range"
              min={1}
              max={6}
              step={1}
              value={params.repetitions}
              onChange={(e) => update("repetitions", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.repetitions}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Shadow</span>
            <input
              type="range"
              min={0}
              max={30}
              step={1}
              value={params.shadowBlur}
              onChange={(e) => update("shadowBlur", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.shadowBlur}</span>
          </label>

          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-muted-foreground">Palette</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(palettes).map((name) => (
                <button
                  key={name}
                  onClick={() => update("palette", name)}
                  className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                    params.palette === name
                      ? "border-foreground/40 bg-foreground/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

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
      <GradientBars
        barCount={params.barCount}
        colors={palettes[params.palette]}
        speed={params.speed}
        phaseShift={params.phaseShift}
        repetitions={params.repetitions}
        shadowBlur={params.shadowBlur}
        backgroundColor={params.backgroundColor}
        className="aspect-square"
      />
    </DemoLayout>
  )
}
