import DemoLayout from "@/components/DemoLayout"
import MeshNoise from "@/components/MeshNoise"
import sourceCode from "@/components/MeshNoise.jsx?raw"
import { useState } from "react"

const defaults = {
  fill: "#000000",
  lineColor: "#ffffff",
  lineWidth: 0.1,
  lineBlur: 2,
  seed: 115,
  speed: 0.5,
  amplitude: 0.2,
  tilt: -43,
  zoom: 0.35,
  height: 2,
  brightness: 3,
}

const sliders = [
  { key: "lineWidth", label: "Line Width", min: 0.01, max: 1, step: 0.01 },
  { key: "lineBlur", label: "Line Blur", min: 0, max: 10, step: 0.1 },
  { key: "seed", label: "Seed", min: 0, max: 500, step: 1 },
  { key: "speed", label: "Speed", min: 0, max: 2, step: 0.01 },
  { key: "amplitude", label: "Amplitude", min: 0, max: 1, step: 0.01 },
  { key: "tilt", label: "Tilt", min: -90, max: 90, step: 1 },
  { key: "zoom", label: "Zoom", min: 0.05, max: 1, step: 0.01 },
  { key: "height", label: "Height", min: 0.1, max: 5, step: 0.1 },
  { key: "brightness", label: "Brightness", min: 0.5, max: 6, step: 0.1 },
]

export default function MeshNoiseDemo() {
  const [props, setProps] = useState(defaults)

  const update = (key, value) =>
    setProps((prev) => ({ ...prev, [key]: value }))

  return (
    <DemoLayout
      title="Mesh Noise"
      description="Animated noise lines with 3D tilt projection, inspired by Framer's Mesh effect."
      sourceCode={sourceCode}
      controls={
        <div className="mt-6 space-y-4 px-1">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Fill
              <input
                type="color"
                value={props.fill}
                onChange={(e) => update("fill", e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Line Color
              <input
                type="color"
                value={props.lineColor}
                onChange={(e) => update("lineColor", e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent"
              />
            </label>
          </div>
          {sliders.map(({ key, label, min, max, step }) => (
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
      <MeshNoise {...props} className="aspect-square" />
    </DemoLayout>
  )
}
