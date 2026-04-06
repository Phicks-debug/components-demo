import DemoLayout from "@/components/DemoLayout"
import WarpText from "@/components/WarpText"
import sourceCode from "@/components/WarpText.jsx?raw"
import { useState } from "react"

const defaults = {
  text: "p5*js",
  background: "#F52CA6",
  color: "#ffffff",
  warpIntensity: 0.06,
  warpSpeed: 0.4,
  noiseScale: 3.0,
  fontSize: 220,
  interactive: true,
}

export default function WarpTextDemo() {
  const [params, setParams] = useState(defaults)
  const update = (key, value) => setParams((prev) => ({ ...prev, [key]: value }))

  return (
    <DemoLayout
      title="Warp Text"
      description="WebGL2 noise-warped text with organic fluid distortion. Hover to interact — text layout powered by @chenglou/pretext."
      sourceCode={sourceCode}
      sourceUrl="https://openprocessing.org/sketch/2850448"
      controls={
        <div className="mt-6 space-y-4 px-1">
          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Text</span>
            <input
              type="text"
              value={params.text}
              onChange={(e) => update("text", e.target.value)}
              className="h-7 flex-1 rounded border border-border bg-transparent px-2 text-xs text-foreground"
            />
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Font Size</span>
            <input
              type="range" min="40" max="400" step="10"
              value={params.fontSize}
              onChange={(e) => update("fontSize", +e.target.value)}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.fontSize}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Warp</span>
            <input
              type="range" min="0" max="0.3" step="0.005"
              value={params.warpIntensity}
              onChange={(e) => update("warpIntensity", +e.target.value)}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.warpIntensity.toFixed(2)}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Speed</span>
            <input
              type="range" min="0.05" max="2" step="0.05"
              value={params.warpSpeed}
              onChange={(e) => update("warpSpeed", +e.target.value)}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.warpSpeed.toFixed(1)}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Noise Scale</span>
            <input
              type="range" min="0.5" max="10" step="0.5"
              value={params.noiseScale}
              onChange={(e) => update("noiseScale", +e.target.value)}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.noiseScale.toFixed(1)}</span>
          </label>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Background</span>
              <input
                type="color" value={params.background}
                onChange={(e) => update("background", e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Text Color</span>
              <input
                type="color" value={params.color}
                onChange={(e) => update("color", e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent"
              />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-muted-foreground">Interactive</span>
            <div className="flex flex-wrap gap-1.5">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => update("interactive", val)}
                  className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                    params.interactive === val
                      ? "border-foreground/40 bg-foreground/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  }`}
                >
                  {val ? "On" : "Off"}
                </button>
              ))}
            </div>
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
      <WarpText
        text={params.text}
        background={params.background}
        color={params.color}
        warpIntensity={params.warpIntensity}
        warpSpeed={params.warpSpeed}
        noiseScale={params.noiseScale}
        fontSize={params.fontSize}
        interactive={params.interactive}
        className="aspect-video"
      />
    </DemoLayout>
  )
}
