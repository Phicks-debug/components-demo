import DemoLayout from "@/components/DemoLayout"
import ContourFlow, { THEMES } from "@/components/ContourFlow"
import sourceCode from "@/components/ContourFlow.jsx?raw"
import { useRef, useState } from "react"

const themeKeys = Object.keys(THEMES)

const GRADIENTS = [
  { name: "Sunset", colors: ["#ff4e00", "#ec1187", "#7b2fbe"] },
  { name: "Ocean", colors: ["#0a1628", "#1a6b8a", "#3dd6f5"] },
  { name: "Aurora", colors: ["#00c97b", "#3b82f6", "#a855f7", "#ec4899"] },
  { name: "Thermal", colors: ["#0d0221", "#cc0000", "#ff8800", "#ffee00", "#ffffff"] },
  { name: "Dusk", colors: ["#0f0c29", "#302b63", "#24243e"] },
]

function createGradientDataUrl(colors, w = 512, h = 512) {
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  const grad = ctx.createLinearGradient(0, 0, w, h)
  colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c))
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
  return canvas.toDataURL()
}

const defaults = {
  speed: 1,
  noiseSpeed: 1,
  grainSpeed: 1,
  pulseSpeed: 1,
  thickness: 0.125,
  frequency: 10,
  theme: "mono",
  fillType: "none", // "none" | "gradient" | "image"
  fillSrc: null,
  gradientName: null,
}

export default function ContourFlowDemo() {
  const [params, setParams] = useState(defaults)
  const update = (key, value) => setParams((p) => ({ ...p, [key]: value }))
  const fileInputRef = useRef(null)

  const selectGradient = (g) => {
    if (params.gradientName === g.name) {
      setParams((p) => ({ ...p, fillType: "none", fillSrc: null, gradientName: null }))
    } else {
      const src = createGradientDataUrl(g.colors)
      setParams((p) => ({ ...p, fillType: "gradient", fillSrc: src, gradientName: g.name }))
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setParams((p) => ({ ...p, fillType: "image", fillSrc: url, gradientName: null }))
  }

  const clearFill = () => {
    if (params.fillType === "image" && params.fillSrc) URL.revokeObjectURL(params.fillSrc)
    setParams((p) => ({ ...p, fillType: "none", fillSrc: null, gradientName: null }))
  }

  return (
    <DemoLayout
      title="Contour Flow"
      description="Animated contour lines using domain-warped fbm noise, rendered via WebGL2."
      sourceCode={sourceCode}
      sourceUrl="https://openprocessing.org/sketch/2729838"
      controls={
        <div className="mt-6 space-y-4 px-1">
          {/* Theme swatches */}
          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-muted-foreground">Theme</span>
            <div className="flex flex-wrap gap-1.5">
              {themeKeys.map((key) => {
                const t = THEMES[key]
                const bgCss = `rgb(${t.bg.map((v) => Math.round(v * 255)).join(",")})`
                const lineCss = `rgb(${t.line.map((v) => Math.round(v * 255)).join(",")})`
                return (
                  <button
                    key={key}
                    onClick={() => update("theme", key)}
                    className={`h-7 w-7 rounded-full transition-all duration-200 hover:scale-110 active:scale-90 ${
                      params.theme === key
                        ? "ring-2 ring-foreground/60 ring-offset-2 ring-offset-background"
                        : "ring-1 ring-border hover:ring-foreground/30"
                    }`}
                    title={key.charAt(0).toUpperCase() + key.slice(1)}
                  >
                    <div
                      className="h-full w-full rounded-full"
                      style={{ background: `linear-gradient(135deg, ${lineCss}, ${bgCss})` }}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Speed</span>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.1}
              value={params.speed}
              onChange={(e) => update("speed", +e.target.value)}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.speed.toFixed(1)}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Noise Speed</span>
            <input
              type="range"
              min={0.1}
              max={4}
              step={0.1}
              value={params.noiseSpeed}
              onChange={(e) => update("noiseSpeed", +e.target.value)}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.noiseSpeed.toFixed(1)}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Grain Speed</span>
            <input
              type="range"
              min={0}
              max={5}
              step={0.1}
              value={params.grainSpeed}
              onChange={(e) => update("grainSpeed", +e.target.value)}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.grainSpeed.toFixed(1)}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Pulse Speed</span>
            <input
              type="range"
              min={0}
              max={5}
              step={0.1}
              value={params.pulseSpeed}
              onChange={(e) => update("pulseSpeed", +e.target.value)}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.pulseSpeed.toFixed(1)}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Thickness</span>
            <input
              type="range"
              min={0.01}
              max={0.3}
              step={0.005}
              value={params.thickness}
              onChange={(e) => update("thickness", +e.target.value)}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.thickness.toFixed(3)}</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Frequency</span>
            <input
              type="range"
              min={2}
              max={25}
              step={0.5}
              value={params.frequency}
              onChange={(e) => update("frequency", +e.target.value)}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">{params.frequency.toFixed(1)}</span>
          </label>

          {/* Gradient fills */}
          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-muted-foreground">Fill</span>
            <div className="flex flex-wrap gap-1.5">
              {GRADIENTS.map((g) => (
                <button
                  key={g.name}
                  onClick={() => selectGradient(g)}
                  className={`h-7 w-7 rounded-full transition-all duration-200 hover:scale-110 active:scale-90 ${
                    params.gradientName === g.name
                      ? "ring-2 ring-foreground/60 ring-offset-2 ring-offset-background"
                      : "ring-1 ring-border hover:ring-foreground/30"
                  }`}
                  title={g.name}
                >
                  <div
                    className="h-full w-full rounded-full"
                    style={{ background: `linear-gradient(135deg, ${g.colors.join(", ")})` }}
                  />
                </button>
              ))}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex h-7 items-center gap-1 rounded-full border px-2.5 text-[10px] transition-all duration-200 hover:scale-105 active:scale-95 ${
                  params.fillType === "image"
                    ? "border-foreground/40 bg-foreground/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                }`}
                title="Upload image"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Image
              </button>

              {params.fillType !== "none" && (
                <button
                  onClick={clearFill}
                  className="flex h-7 items-center rounded-full border border-border px-2.5 text-[10px] text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                  title="Clear fill"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              if (params.fillType === "image" && params.fillSrc) URL.revokeObjectURL(params.fillSrc)
              setParams(defaults)
            }}
            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Reset
          </button>
        </div>
      }
    >
      <ContourFlow
        speed={params.speed}
        noiseSpeed={params.noiseSpeed}
        grainSpeed={params.grainSpeed}
        pulseSpeed={params.pulseSpeed}
        thickness={params.thickness}
        frequency={params.frequency}
        colors={THEMES[params.theme]}
        imageSrc={params.fillType !== "none" ? params.fillSrc : undefined}
        className="aspect-video"
      />
    </DemoLayout>
  )
}
