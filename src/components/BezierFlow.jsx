import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

function hexToRgb(hex) {
  const v = parseInt(hex.replace("#", ""), 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}

export default function BezierFlow({
  curveCount = 3000,
  speed = 1,
  backgroundColor = "#f5f5f5",
  strokeColor = "#000066",
  strokeAlpha = 50,
  spread = 50,
  amplitude = 500,
  thickness = 0.008,
  className,
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const propsRef = useRef({ speed, backgroundColor, strokeColor, strokeAlpha, amplitude, thickness })
  propsRef.current = { speed, backgroundColor, strokeColor, strokeAlpha, amplitude, thickness }

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const curves = Array.from({ length: curveCount }, () => ({
      x1: Math.random() * spread * 2 - spread,
      x4: Math.random() * spread * 2 - spread,
    }))

    let width = 0
    let height = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const rect = container.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(container)
    resize()

    let frameId
    const startTime = performance.now()

    const render = () => {
      const { speed: spd, backgroundColor: bg, strokeColor: sc, strokeAlpha: sa, amplitude: amp, thickness: thk } = propsRef.current
      const time = ((performance.now() - startTime) / 1000) * 0.5 * spd
      const s = height / 1000
      const halfH = height / 2
      const [br, bg2, bb] = hexToRgb(sc)
      const baseAlpha = sa / 255

      ctx.fillStyle = bg
      ctx.fillRect(0, 0, width, height)
      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.lineCap = "square"

      // Batch curves by quantized brightness for performance
      const batches = new Map()
      for (let i = 0; i < curves.length; i++) {
        const phase = i * 0.1
        const pulse = (Math.sin(time * 2 + phase) + 1) * 0.5
        const key = Math.round(pulse * 20)
        if (!batches.has(key)) batches.set(key, [])
        batches.get(key).push(i)
      }

      for (const [pKey, indices] of batches) {
        const pulse = pKey / 20
        const lum = pulse * 0.6 + 0.4
        const r = Math.round(br * lum)
        const g = Math.round(bg2 * lum)
        const b = Math.round(bb * lum)
        const lw = (pulse * 155 + 100) * thk

        ctx.beginPath()
        ctx.strokeStyle = `rgba(${r},${g},${b},${baseAlpha})`
        ctx.lineWidth = lw

        for (const i of indices) {
          const c = curves[i]
          const t = time + i * 0.001
          const ampS = amp * s
          const cxo1 = Math.sin(t) * ampS
          const cxo2 = Math.cos(t) * ampS

          const x1 = c.x1 * s + cxo1
          const y1 = -halfH
          const x2 = c.x1 * s + cxo2 - ampS
          const y2 = -halfH + ampS
          const x3 = c.x4 * s + cxo2 + ampS
          const y3 = halfH - ampS
          const x4 = c.x4 * s + cxo1
          const y4 = halfH

          ctx.moveTo(x1, y1)
          ctx.bezierCurveTo(x2, y2, x3, y3, x4, y4)
        }

        ctx.stroke()
      }

      ctx.restore()
      frameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [curveCount, spread])

  return (
    <div ref={containerRef} className={cn("relative h-full w-full", className)}>
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}
