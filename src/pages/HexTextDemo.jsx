import DemoLayout from "@/components/DemoLayout"
import HexText, { THEMES } from "@/components/HexText"
import sourceCode from "@/components/HexText.jsx?raw"
import { useState } from "react"

const themeKeys = Object.keys(THEMES)

const defaults = {
  text: "",
  theme: "mono",
  speed: 1,
  hexSize: 24,
}

export default function HexTextDemo() {
  const [params, setParams] = useState(defaults)

  const update = (key, value) =>
    setParams((prev) => ({ ...prev, [key]: value }))

  return (
    <DemoLayout
      title="Hex Text"
      description="Hexagonal grid with Perlin noise, overlayed with pixel-font text that drifts across the surface."
      sourceCode={sourceCode}
      sourceUrl="https://openprocessing.org/sketch/2839063"
      controls={
        <div className="mt-6 space-y-4 px-1">
          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Text</span>
            <input
              type="text"
              value={params.text}
              onChange={(e) => update("text", e.target.value)}
              className="flex-1 rounded-md border border-border bg-transparent px-3 py-1.5 text-xs text-foreground outline-none focus:border-foreground/40"
              placeholder="Type something..."
            />
          </label>

          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-muted-foreground">Theme</span>
            <div className="flex flex-wrap gap-1.5">
              {themeKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => update("theme", key)}
                  className={`flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs transition-colors ${
                    params.theme === key
                      ? "border-foreground/40 bg-foreground/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  }`}
                >
                  <span className="inline-flex gap-0.5">
                    <span className="h-3 w-3 rounded-sm" style={{ background: THEMES[key].fg }} />
                    <span className="h-3 w-3 rounded-sm" style={{ background: THEMES[key].bg }} />
                  </span>
                  {THEMES[key].name}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Hex Size</span>
            <input
              type="range"
              min={8}
              max={50}
              step={1}
              value={params.hexSize}
              onChange={(e) => update("hexSize", Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.hexSize}</span>
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

          <button
            onClick={() => setParams(defaults)}
            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Reset
          </button>
        </div>
      }
    >
      <HexText
        text={params.text}
        theme={params.theme}
        speed={params.speed}
        hexSize={params.hexSize}
        className="aspect-video"
      />
    </DemoLayout>
  )
}
