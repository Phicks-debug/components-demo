import { useEffect, useRef } from "react"

export default function GeometryMotif({
  className = "",
  elementCount = 20,
  speed = 1.0,
  backgroundColor = "#f5f5f5",
  shapeColor = "#ffffff",
  oscillationSpeed = 0.01,
  ellipseDrift = 0.001,
  maxHeightRatio = 0.7,
}) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: false })
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

    function buildElements() {
      const els = []
      for (let i = 0; i < elementCount; i++) {
        const baseH = Math.random() * h * maxHeightRatio
        els.push({
          originY: Math.random() * h - h / 2,
          baseH,
          h: baseH,
          ellipseBaseX: Math.random() * w - w / 2,
          ellipseX: 0,
        })
      }
      stateRef.current = els
    }

    resize()
    buildElements()

    let frame = 0

    function draw() {
      raf = requestAnimationFrame(draw)
      frame++

      ctx.globalCompositeOperation = "source-over"
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, w, h)

      ctx.save()
      ctx.translate(w / 2, h / 2)

      const els = stateRef.current
      if (!els) { ctx.restore(); return }

      for (let i = 0; i < els.length; i++) {
        const el = els[i]
        const t = frame * speed

        el.originY = Math.sin(i + t * oscillationSpeed) * h / 2
        el.h = Math.sin(i + t * oscillationSpeed) * el.baseH / 2 + el.baseH
        el.ellipseX = Math.sin(i + t * ellipseDrift) * h / 2 + el.ellipseBaseX

        ctx.save()
        ctx.translate(0, el.originY)
        ctx.globalCompositeOperation = "difference"
        ctx.fillStyle = shapeColor

        ctx.fillRect(-w / 2, -el.h / 2, w, el.h)

        ctx.beginPath()
        ctx.ellipse(el.ellipseX, 0, el.h / 2, el.h / 2, 0, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
      }

      ctx.restore()
    }

    const ro = new ResizeObserver(() => {
      resize()
      buildElements()
    })
    ro.observe(canvas)
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [elementCount, speed, backgroundColor, shapeColor, oscillationSpeed, ellipseDrift, maxHeightRatio])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  )
}
