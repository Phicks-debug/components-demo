import { useState } from "react"
import { Link } from "react-router-dom"
import OpenAIWaveGradient, { THEMES } from "@/components/OpenAIWaveGradient"
import sourceCode from "@/components/OpenAIWaveGradient.jsx?raw"

const themeKeys = Object.keys(THEMES)

export default function OpenAIWaveGradientDemo() {
  const [activeTheme, setActiveTheme] = useState("amber")
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sourceCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            &larr; Back
          </Link>
          <h1 className="mt-2 text-lg font-semibold tracking-tight">
            OpenAI Wave Gradient
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            WebGL2 animated wave gradient with configurable color themes.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Code
            </>
          )}
        </button>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border">
        <OpenAIWaveGradient
          colors={THEMES[activeTheme]}
          className="aspect-video"
        />
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Theme
        </span>
        <div className="flex flex-wrap justify-center gap-3">
          {themeKeys.map((theme) => (
            <button
              key={theme}
              onClick={() => setActiveTheme(theme)}
              className={`h-7 w-7 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 ${
                activeTheme === theme
                  ? "ring-2 ring-foreground/60 ring-offset-3 ring-offset-background"
                  : "ring-1 ring-border hover:ring-foreground/30"
              }`}
              title={theme.charAt(0).toUpperCase() + theme.slice(1)}
            >
              <div
                className="h-full w-full rounded-full"
                style={{
                  background: `linear-gradient(135deg, rgb(${THEMES[theme].main
                    .map((c) => Math.round(c * 255))
                    .join(",")}), rgb(${THEMES[theme].low
                    .map((c) => Math.round(c * 255))
                    .join(",")})`,
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
