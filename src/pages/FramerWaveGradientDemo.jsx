import DemoLayout from "@/components/DemoLayout"
import FramerWaveGradient, { THEMES } from "@/components/FramerWaveGradient"
import sourceCode from "@/components/FramerWaveGradient.jsx?raw"
import { useState } from "react"

const themeKeys = Object.keys(THEMES)

export default function FramerWaveGradientDemo() {
  const [activeTheme, setActiveTheme] = useState("sunset")

  return (
    <DemoLayout
      title="Framer Wave Gradient"
      description="WebGL2 animated wave gradient with flowing organic color layers."
      sourceCode={sourceCode}
      controls={
        <div className="mt-6 flex flex-col items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Theme
          </span>
          <div className="flex flex-wrap justify-center gap-3">
            {themeKeys.map((theme) => (
              <button
                key={theme}
                onClick={() => setActiveTheme(theme)}
                className={`h-7 w-7 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 ${activeTheme === theme
                  ? "ring-2 ring-foreground/60 ring-offset-3 ring-offset-background"
                  : "ring-1 ring-border hover:ring-foreground/30"
                  }`}
                title={theme.charAt(0).toUpperCase() + theme.slice(1)}
              >
                <div
                  className="h-full w-full rounded-full"
                  style={{
                    background: `linear-gradient(135deg, rgb(${THEMES[theme].color1
                      .map((c) => Math.round(c * 255))
                      .join(",")}), rgb(${THEMES[theme].color3
                        .map((c) => Math.round(c * 255))
                        .join(",")})`,
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      }
    >
      <FramerWaveGradient
        colors={THEMES[activeTheme]}
        className="aspect-video"
      />
    </DemoLayout>
  )
}
