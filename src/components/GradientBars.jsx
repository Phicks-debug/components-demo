import { useEffect, useRef } from "react"

const SKYSPIDER = ["#f4b232", "#f2dbbd", "#01799c", "#e93e48", "#0b1952", "#006748", "#ed817d"]

export default function GradientBars({
  className = "",
  barCount = 20,
  colors = SKYSPIDER,
  speed = 0.025,
  phaseShift = 0.25,
  repetitions = 2,
  backgroundColor = "#f5f5f5",
  shadowBlur = 10,
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    let raf
    let w, h

    function resize() {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    let frame = 0

    function draw() {
      raf = requestAnimationFrame(draw)
      frame++

      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, w, h)

      const expanded = Array(repetitions).fill(colors).flat()
      const numColors = expanded.length
      const stepX = w / barCount
      const barW = stepX
      const offsetX = -(barCount * stepX) / 2 + stepX / 2

      ctx.save()
      ctx.translate(w / 2, h / 2)

      for (let i = 0; i < barCount; i++) {
        const ox = i * stepX + offsetX
        const targetH = h * 3
        const baseH = h / 2
        const gradientY =
          (targetH / 2 - baseH) * Math.sin(frame * speed - i * phaseShift) +
          targetH / 2

        const grad = ctx.createLinearGradient(
          ox, -gradientY / 2,
          ox, gradientY / 2,
        )
        for (let c = 0; c < numColors; c++) {
          grad.addColorStop((c + 0.5) / numColors, expanded[c])
        }

        ctx.shadowColor = colors[0]
        ctx.shadowBlur = shadowBlur
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2

        ctx.fillStyle = grad
        ctx.fillRect(ox - barW / 2, -h / 2, barW, h)
      }

      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      ctx.restore()
    }

    const ro = new ResizeObserver(() => resize())
    ro.observe(canvas)
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [barCount, colors, speed, phaseShift, repetitions, backgroundColor, shadowBlur])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  )
}
