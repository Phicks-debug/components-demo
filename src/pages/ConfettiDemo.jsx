import Confetti from "@/components/Confetti"
import DemoLayout from "@/components/DemoLayout"
import sourceCode from "@/components/Confetti.jsx?raw"
import { useRef, useState } from "react"

const defaults = {
  particleCount: 195,
  startVelocity: 31,
  spread: 107,
  decay: 0.92,
  gravity: 1.2,
  duration: 3.6,
}

const params = [
  { key: "particleCount", label: "Particle Count", min: 10, max: 500, step: 1 },
  { key: "startVelocity", label: "Start Velocity", min: 5, max: 150, step: 1 },
  { key: "spread", label: "Spread", min: 10, max: 360, step: 1 },
  { key: "decay", label: "Decay", min: 0.8, max: 1, step: 0.01 },
  { key: "gravity", label: "Gravity", min: 0, max: 10, step: 0.1 },
  { key: "duration", label: "Duration", min: 0.5, max: 10, step: 0.1 },
]

export default function ConfettiDemo() {
  const [props, setProps] = useState(defaults)
  const confettiRef = useRef(null)

  const update = (key, value) =>
    setProps((prev) => ({ ...prev, [key]: value }))

  return (
    <DemoLayout
      title="Confetti"
      description="Canvas-based confetti burst with configurable physics."
      sourceCode={sourceCode}
      sourceUrl="https://motion.dev/examples/react-confetti?platform=react"
      controls={
        <div className="mt-6 space-y-4 px-1">
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
      <div className="relative flex aspect-video items-center justify-center bg-black">
        <Confetti ref={confettiRef} {...props} />

        <button
          onClick={() => confettiRef.current?.fire()}
          className="z-10 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
          Celebrate
        </button>
      </div>
    </DemoLayout>
  )
}
