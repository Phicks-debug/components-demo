import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "next-themes"
import Navbar from "@/components/Navbar"
import Home from "@/pages/Home"
import OpenAIWaveGradientDemo from "@/pages/OpenAIWaveGradientDemo"

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/openai-wave-gradient" element={<OpenAIWaveGradientDemo />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
