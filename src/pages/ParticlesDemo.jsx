import DemoLayout from "@/components/DemoLayout"
import Particles from "@/components/Particles"
import sourceCode from "@/components/Particles.jsx?raw"
import { useState } from "react"

const defaults = {
  background: "#000000",
  color: "#ffffff",
  warp: false,
  randomize: true,
  speed: 3.6,
  scale: 1.8,
  brightness: 0.14,
  size: 0.76,
  blink: false,
  count: 100,
}

const sliders = [
  { key: "count", label: "Count", min: 10, max: 500, step: 1 },
  { key: "speed", label: "Speed", min: 0.1, max: 10, step: 0.1 },
  { key: "scale", label: "Scale", min: 0.1, max: 5, step: 0.1 },
  { key: "brightness", label: "Brightness", min: 0.01, max: 1, step: 0.01 },
  { key: "size", label: "Size", min: 0.1, max: 3, step: 0.01 },
]

const toggles = [
  { key: "warp", label: "Warp" },
  { key: "randomize", label: "Randomize" },
  { key: "blink", label: "Blink" },
]

export default function ParticlesDemo() {
  const [props, setProps] = useState(defaults)

  const update = (key, value) =>
    setProps((prev) => ({ ...prev, [key]: value }))

  return (
    <DemoLayout
      title="Particles"
      description="Floating particle field with glow, warp, and blink effects."
      sourceCode={sourceCode}
      controls={
        <div className="mt-6 space-y-4 px-1">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Background</span>
            <input
              type="color"
              value={props.background}
              onChange={(e) => update("background", e.target.value)}
              className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent"
            />
            <span className="font-mono text-[11px]">
              {props.background.replace("#", "").toUpperCase()}
            </span>
          </label>

          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Color</span>
            <input
              type="color"
              value={props.color}
              onChange={(e) => update("color", e.target.value)}
              className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent"
            />
            <span className="font-mono text-[11px]">
              {props.color.replace("#", "").toUpperCase()}
            </span>
          </label>

          {toggles.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">
                {label}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {["Yes", "No"].map((opt) => {
                  const active =
                    (opt === "Yes" && props[key]) ||
                    (opt === "No" && !props[key])
                  return (
                    <button
                      key={opt}
                      onClick={() => update(key, opt === "Yes")}
                      className={`rounded-md border px-3 py-1 text-xs transition-colors ${
                        active
                          ? "border-foreground/40 bg-foreground/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                      }`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {sliders.map(({ key, label, min, max, step }) => (
            <label
              key={key}
              className="flex items-center gap-3 text-xs text-muted-foreground"
            >
              <span className="w-24 shrink-0">{label}</span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={props[key]}
                onChange={(e) => update(key, key === "count" ? parseInt(e.target.value) : parseFloat(e.target.value))}
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
      <div className="relative aspect-video">
        <Particles className="absolute inset-0 h-full w-full" {...props} />
      </div>
    </DemoLayout>
  )
}
