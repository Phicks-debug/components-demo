import Navbar from "@/components/Navbar"
import BauhausGridDemo from "@/pages/BauhausGridDemo"
import ConfettiDemo from "@/pages/ConfettiDemo"
import FramerWaveGradientDemo from "@/pages/FramerWaveGradientDemo"
import HexTextDemo from "@/pages/HexTextDemo"
import Home from "@/pages/Home"
import LiquidGradientDemo from "@/pages/LiquidGradientDemo"
import MeshNoiseDemo from "@/pages/MeshNoiseDemo"
import OpenAIWaveGradientDemo from "@/pages/OpenAIWaveGradientDemo"
import PatternCanvasDemo from "@/pages/PatternCanvasDemo"
import ParticleGlobeDemo from "@/pages/ParticleGlobeDemo"
import ParticlesDemo from "@/pages/ParticlesDemo"
import PixelizeDemo from "@/pages/PixelizeDemo"
import GeometryMotifDemo from "@/pages/GeometryMotifDemo"
import GradientBarsDemo from "@/pages/GradientBarsDemo"
import PointerFieldDemo from "@/pages/PointerFieldDemo"
import BezierFlowDemo from "@/pages/BezierFlowDemo"
import ContourFlowDemo from "@/pages/ContourFlowDemo"
import ReactionDiffusionDemo from "@/pages/ReactionDiffusionDemo"
import WarholTypeDemo from "@/pages/WarholTypeDemo"
import WarpTextDemo from "@/pages/WarpTextDemo"
import { ThemeProvider } from "next-themes"
import { BrowserRouter, Route, Routes } from "react-router-dom"

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/openai-wave-gradient" element={<OpenAIWaveGradientDemo />} />
            <Route path="/framer-wave-gradient" element={<FramerWaveGradientDemo />} />
            <Route path="/pointer-field" element={<PointerFieldDemo />} />
            <Route path="/mesh-noise" element={<MeshNoiseDemo />} />
            <Route path="/confetti" element={<ConfettiDemo />} />
            <Route path="/pattern-canvas" element={<PatternCanvasDemo />} />
            <Route path="/pixelize" element={<PixelizeDemo />} />
            <Route path="/liquid-gradient" element={<LiquidGradientDemo />} />
            <Route path="/particles" element={<ParticlesDemo />} />
            <Route path="/bauhaus-grid" element={<BauhausGridDemo />} />
            <Route path="/particle-globe" element={<ParticleGlobeDemo />} />
            <Route path="/hex-text" element={<HexTextDemo />} />
            <Route path="/geometry-motif" element={<GeometryMotifDemo />} />
            <Route path="/gradient-bars" element={<GradientBarsDemo />} />
            <Route path="/bezier-flow" element={<BezierFlowDemo />} />
            <Route path="/warhol-type" element={<WarholTypeDemo />} />
            <Route path="/contour-flow" element={<ContourFlowDemo />} />
            <Route path="/warp-text" element={<WarpTextDemo />} />
            <Route path="/reaction-diffusion" element={<ReactionDiffusionDemo />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
