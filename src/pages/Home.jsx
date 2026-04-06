import BauhausGrid from "@/components/BauhausGrid"
import GeometryMotif from "@/components/GeometryMotif"
import GradientBars from "@/components/GradientBars"
import Confetti from "@/components/Confetti"
import HexText from "@/components/HexText"
import ParticleGlobe from "@/components/ParticleGlobe"
import Particles from "@/components/Particles"
import FramerWaveGradient from "@/components/FramerWaveGradient"
import LiquidGradient from "@/components/LiquidGradient"
import MeshNoise from "@/components/MeshNoise"
import OpenAIWaveGradient from "@/components/OpenAIWaveGradient"
import PatternCanvas from "@/components/PatternCanvas"
import Pixelize from "@/components/Pixelize"
import PointerField from "@/components/PointerField"
import BezierFlow from "@/components/BezierFlow"
import ContourFlow from "@/components/ContourFlow"
import WarholType from "@/components/WarholType"
import ReactionDiffusion from "@/components/ReactionDiffusion"
import WarpText from "@/components/WarpText"
import { Link } from "react-router-dom"

const components = [
  {
    title: "OpenAI Wave Gradient",
    description: "WebGL2 animated wave gradient with configurable color themes.",
    path: "/openai-wave-gradient",
    preview: <OpenAIWaveGradient className="absolute inset-0 h-full w-full" />,
    source: { label: "davidumoru.me", url: "https://playground.davidumoru.me/" },
  },
  {
    title: "Framer Wave Gradient",
    description: "Flowing organic color layers inspired by Framer's visual style.",
    path: "/framer-wave-gradient",
    preview: <FramerWaveGradient className="absolute inset-0 h-full w-full" />,
  },
  {
    title: "Pointer Field",
    description: "Grid of lines that rotate to track the mouse cursor.",
    path: "/pointer-field",
    preview: <PointerField className="absolute inset-0 h-full w-full" />,
    previewBg: "bg-black text-white",
    source: { label: "motion.dev", url: "https://examples.motion.dev/react/magnetic-filings" },
  },
  {
    title: "Mesh Noise",
    description: "Animated noise contour lines with 3D tilt projection.",
    path: "/mesh-noise",
    preview: <MeshNoise className="absolute inset-0 h-full w-full" />,
    previewBg: "bg-black text-white",
  },
  {
    title: "Confetti",
    description: "Canvas-based confetti burst with configurable physics.",
    path: "/confetti",
    preview: <Confetti className="absolute inset-0 h-full w-full" />,
    previewBg: "bg-black text-white",
    source: { label: "motion.dev", url: "https://motion.dev/examples/react-confetti?platform=react" },
  },
  {
    title: "Pattern Canvas",
    description: "Infinitely tiling pattern with zoom and pan, like texture mapping.",
    path: "/pattern-canvas",
    preview: <PatternCanvas className="absolute inset-0 h-full w-full" interactive={false} />,
  },
  {
    title: "Liquid Gradient",
    description: "Liquid gradient with domain-warped noise and iridescent palettes.",
    path: "/liquid-gradient",
    preview: <LiquidGradient className="absolute inset-0 h-full w-full" />,
  },
  {
    title: "Particles",
    description: "Floating particle field with glow, warp, and blink effects.",
    path: "/particles",
    preview: <Particles className="absolute inset-0 h-full w-full" />,
    previewBg: "bg-black text-white",
  },
  {
    title: "Pixelize",
    description: "Pixelate any image or gradient with stagger, aberration, and hue shifting.",
    path: "/pixelize",
    preview: (
      <Pixelize
        gradient={{ colors: ["#ff6b6b", "#ffa36b", "#ffd93d", "#6bcb77"], angle: 135 }}
        pixels={20}
        className="absolute inset-0 h-full w-full"
      />
    ),
  },
  {
    title: "Bauhaus Grid",
    description: "Order and disorder — animated semicircles driven by a binary counter.",
    path: "/bauhaus-grid",
    preview: <BauhausGrid className="absolute inset-0 h-full w-full" />,
    source: { label: "openprocessing.org", url: "https://openprocessing.org/sketch/2845065" },
  },
  {
    title: "Particle Globe",
    description: "A rotating sphere-like cloud of particles that scatters around the cursor.",
    path: "/particle-globe",
    preview: <ParticleGlobe className="absolute inset-0 h-full w-full" />,
    previewBg: "bg-black text-white",
    source: { label: "openprocessing.org", url: "https://openprocessing.org/sketch/2812705" },
  },
  {
    title: "Hex Text",
    description: "Hexagonal grid with Perlin noise and drifting pixel-font text overlay.",
    path: "/hex-text",
    preview: <HexText text="Hi" className="absolute inset-0 h-full w-full" />,
    previewBg: "bg-black text-white",
    source: { label: "openprocessing.org", url: "https://openprocessing.org/sketch/2839063" },
  },
  {
    title: "Geometry Motif",
    description: "Animated geometric shapes with DIFFERENCE blend — overlapping rects and ellipses create shifting inversions.",
    path: "/geometry-motif",
    preview: <GeometryMotif className="absolute inset-0 h-full w-full" />,
    source: { label: "openprocessing.org", url: "https://openprocessing.org/sketch/2389024" },
  },
  {
    title: "Gradient Bars",
    description: "Animated vertical bars with repeating linear gradients and sine-wave phase shifting.",
    path: "/gradient-bars",
    preview: <GradientBars className="absolute inset-0 h-full w-full" />,
    source: { label: "openprocessing.org", url: "https://openprocessing.org/sketch/2554026" },
  },
  {
    title: "Bezier Flow",
    description: "Flowing field of animated bezier curves with oscillating control points.",
    path: "/bezier-flow",
    preview: <BezierFlow className="absolute inset-0 h-full w-full" />,
  },
  {
    title: "Warhol Type",
    description: "Render any image as colored typography characters — pop-art meets ASCII.",
    path: "/warhol-type",
    preview: <WarholType imageSrc="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=60" fontSize={8} scrambleSpeed={4} className="absolute inset-0 h-full w-full" />,
    previewBg: "bg-black text-white",
    source: { label: "openprocessing.org", url: "https://openprocessing.org/sketch/2500596" },
  },
  {
    title: "Contour Flow",
    description: "Animated contour lines using domain-warped fbm noise, rendered via WebGL2.",
    path: "/contour-flow",
    preview: <ContourFlow className="absolute inset-0 h-full w-full" />,
    source: { label: "openprocessing.org", url: "https://openprocessing.org/sketch/2729838" },
  },
  {
    title: "Warp Text",
    description: "Noise-warped text with organic fluid distortion via WebGL2.",
    path: "/warp-text",
    preview: <WarpText className="absolute inset-0 h-full w-full" />,
    source: { label: "openprocessing.org", url: "https://openprocessing.org/sketch/2850448" },
  },
  {
    title: "Reaction Diffusion",
    description: "Type text that dissolves into organic patterns via blur + unsharp feedback.",
    path: "/reaction-diffusion",
    preview: <ReactionDiffusion initialText="Hello" interactive={false} className="absolute inset-0 h-full w-full" />,
    previewBg: "bg-black text-white",
    source: { label: "openprocessing.org", url: "https://openprocessing.org/sketch/2752204" },
  },
]

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Phicks's Component Collection</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        A curated collection of animated and visual React components — ready to explore, remix, and copy into your next project.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {components.map((c) => (
          <Link
            key={c.path}
            to={c.path}
            className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-foreground/20 hover:shadow-lg"
          >
            <div className={`relative aspect-4/3 overflow-hidden ${c.previewBg || "bg-muted"}`}>
              <div className="pointer-events-none absolute inset-0">
                {c.preview}
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-card/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <div className="p-4">
              <p className="text-sm font-medium">{c.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {c.description}
              </p>
              {c.source && (
                <p className="mt-1.5 text-[10px] text-muted-foreground/70">
                  Source:{" "}
                  <span className="underline decoration-muted-foreground/30">
                    {c.source.label}
                  </span>
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
