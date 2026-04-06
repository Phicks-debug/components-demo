import { useRef, useState } from "react"
import Pixelize from "@/components/Pixelize"
import DemoLayout from "@/components/DemoLayout"
import sourceCode from "@/components/Pixelize.jsx?raw"

const GRADIENTS = {
  sunset: { colors: ["#ff6b6b", "#ffa36b", "#ffd93d", "#6bcb77"], angle: 135 },
  ocean: { colors: ["#0f0c29", "#302b63", "#24243e", "#0f0c29"], angle: 180 },
  aurora: { colors: ["#a8edea", "#fed6e3", "#d299c2", "#a8edea"], angle: 45 },
  neon: { colors: ["#ff00cc", "#333399", "#00ffcc"], angle: 135 },
  fire: { colors: ["#f12711", "#f5af19", "#f12711"], angle: 180 },
  lavender: { colors: ["#e0c3fc", "#8ec5fc", "#e0c3fc"], angle: 120 },
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&q=80"

const defaults = {
  pixels: 39,
  stagger: 0.03,
  border: 0,
  aberration: 0,
  hueShift: -0.34,
}

const params = [
  { key: "pixels", label: "Pixels", min: 4, max: 120, step: 1 },
  { key: "stagger", label: "Stagger", min: 0, max: 1, step: 0.01 },
  { key: "border", label: "Border", min: 0, max: 10, step: 0.5 },
  { key: "aberration", label: "Aberration", min: 0, max: 5, step: 0.1 },
  { key: "hueShift", label: "Hue Shift", min: -1, max: 1, step: 0.01 },
]

export default function PixelizeDemo() {
  const [props, setProps] = useState(defaults)
  const [sourceMode, setSourceMode] = useState("gradient")
  const [imageSrc, setImageSrc] = useState(DEFAULT_IMAGE)
  const [activeGradient, setActiveGradient] = useState("sunset")
  const fileInputRef = useRef(null)

  const update = (key, value) =>
    setProps((prev) => ({ ...prev, [key]: value }))

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageSrc(URL.createObjectURL(file))
    setSourceMode("image")
  }

  return (
    <DemoLayout
      title="Pixelize"
      description="Pixelate any image or gradient with stagger, chromatic aberration, and hue shifting."
      sourceCode={sourceCode}
      controls={
        <div className="mt-6 space-y-4 px-1">
          {/* Source toggle */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Source</span>
            <div className="flex flex-wrap gap-1.5">
              {["gradient", "image"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSourceMode(mode)}
                  className={`rounded-md border px-3 py-1.5 text-xs capitalize transition-colors ${
                    sourceMode === mode
                      ? "border-foreground/40 bg-foreground/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Gradient presets */}
          {sourceMode === "gradient" && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="w-24 shrink-0">Gradient</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(GRADIENTS).map(([key, g]) => (
                  <button
                    key={key}
                    onClick={() => setActiveGradient(key)}
                    className={`h-7 w-7 rounded-full transition-all hover:scale-110 active:scale-90 ${
                      activeGradient === key
                        ? "ring-2 ring-foreground/60 ring-offset-2 ring-offset-background"
                        : "ring-1 ring-border hover:ring-foreground/30"
                    }`}
                    title={key}
                  >
                    <div
                      className="h-full w-full rounded-full"
                      style={{
                        background: `linear-gradient(${g.angle}deg, ${g.colors.join(", ")})`,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image upload */}
          {sourceMode === "image" && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="w-24 shrink-0">Image</span>
              <div className="flex flex-1 items-center gap-2">
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt="preview"
                    className="h-8 w-12 rounded border border-border object-cover"
                  />
                )}
                <label className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  Upload
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Sliders */}
          {params.map(({ key, label, min, max, step }) => (
            <label key={key} className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="w-24 shrink-0">{label}</span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={props[key]}
                onChange={(e) => update(key, parseFloat(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
              />
              <span className="w-10 text-right font-mono tabular-nums">
                {props[key]}
              </span>
            </label>
          ))}
          <button
            onClick={() => setProps(defaults)}
            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Reset
          </button>
        </div>
      }
    >
      <div className="relative aspect-video bg-black">
        <Pixelize
          imageSrc={sourceMode === "image" ? imageSrc : undefined}
          gradient={sourceMode === "gradient" ? GRADIENTS[activeGradient] : undefined}
          {...props}
        />
      </div>
    </DemoLayout>
  )
}
