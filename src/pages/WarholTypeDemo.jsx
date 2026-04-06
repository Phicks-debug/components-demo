import { useRef, useState } from "react"
import WarholType, { CHARSETS } from "@/components/WarholType"
import DemoLayout from "@/components/DemoLayout"
import sourceCode from "@/components/WarholType.jsx?raw"

const SAMPLE_IMAGES = [
  { label: "Portrait", url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80" },
  { label: "City", url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&q=80" },
  { label: "Flower", url: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&q=80" },
  { label: "Cat", url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80" },
]

const FONT_OPTIONS = [
  { label: "Mono", value: "monospace" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Sans", value: "Arial, sans-serif" },
  { label: "System", value: "system-ui" },
]

const defaults = {
  fontSize: 12,
  charset: "mixed",
  fontFamily: "monospace",
  scrambleSpeed: 6,
}

export default function WarholTypeDemo() {
  const [props, setProps] = useState(defaults)
  const [imageSrc, setImageSrc] = useState(SAMPLE_IMAGES[0].url)
  const [activePreset, setActivePreset] = useState(0)
  const fileInputRef = useRef(null)

  const update = (key, value) =>
    setProps((prev) => ({ ...prev, [key]: value }))

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageSrc(URL.createObjectURL(file))
    setActivePreset(-1)
  }

  return (
    <DemoLayout
      title="Warhol Type"
      description="Render any image as colored typography characters — a Warhol pop-art effect."
      sourceCode={sourceCode}
      sourceUrl="https://openprocessing.org/sketch/2500596"
      controls={
        <div className="mt-6 space-y-4 px-1">
          {/* Image presets */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Image</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {SAMPLE_IMAGES.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setImageSrc(img.url)
                    setActivePreset(i)
                  }}
                  className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                    activePreset === i
                      ? "border-foreground/40 bg-foreground/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  }`}
                >
                  {img.label}
                </button>
              ))}
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

          {/* Charset */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Characters</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(CHARSETS).map((key) => (
                <button
                  key={key}
                  onClick={() => update("charset", key)}
                  className={`rounded-md border px-3 py-1.5 text-xs capitalize transition-colors ${
                    props.charset === key
                      ? "border-foreground/40 bg-foreground/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Font */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Font</span>
            <div className="flex flex-wrap gap-1.5">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => update("fontFamily", f.value)}
                  className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                    props.fontFamily === f.value
                      ? "border-foreground/40 bg-foreground/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font size */}
          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Font Size</span>
            <input
              type="range"
              min={4}
              max={32}
              step={1}
              value={props.fontSize}
              onChange={(e) => update("fontSize", parseFloat(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">
              {props.fontSize}
            </span>
          </label>

          {/* Scramble speed */}
          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-24 shrink-0">Scramble</span>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={props.scrambleSpeed}
              onChange={(e) => update("scrambleSpeed", parseFloat(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 text-right font-mono tabular-nums">
              {props.scrambleSpeed}
            </span>
          </label>

          <button
            onClick={() => {
              setProps(defaults)
              setImageSrc(SAMPLE_IMAGES[0].url)
              setActivePreset(0)
            }}
            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Reset
          </button>
        </div>
      }
    >
      <div className="relative aspect-video bg-black">
        <WarholType
          imageSrc={imageSrc}
          {...props}
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </DemoLayout>
  )
}
