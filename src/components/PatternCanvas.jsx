import { useRef, useEffect, useCallback } from "react"

const BUILT_IN_PATTERNS = {
  grid: (size, color, weight) => {
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    ctx.strokeStyle = color
    ctx.lineWidth = weight
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(size, 0)
    ctx.moveTo(0, 0)
    ctx.lineTo(0, size)
    ctx.stroke()
    return canvas
  },
  dots: (size, color, weight) => {
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, weight * 1.5, 0, Math.PI * 2)
    ctx.fill()
    return canvas
  },
  crosses: (size, color, weight) => {
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    ctx.strokeStyle = color
    ctx.lineWidth = weight
    ctx.lineCap = "round"
    const cx = size / 2
    const cy = size / 2
    const arm = size * 0.2
    ctx.beginPath()
    ctx.moveTo(cx - arm, cy)
    ctx.lineTo(cx + arm, cy)
    ctx.moveTo(cx, cy - arm)
    ctx.lineTo(cx, cy + arm)
    ctx.stroke()
    return canvas
  },
  checkerboard: (size, color) => {
    const canvas = document.createElement("canvas")
    canvas.width = size * 2
    canvas.height = size * 2
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = color
    ctx.fillRect(0, 0, size, size)
    ctx.fillRect(size, size, size, size)
    return canvas
  },
  diagonal: (size, color, weight) => {
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    ctx.strokeStyle = color
    ctx.lineWidth = weight
    ctx.beginPath()
    ctx.moveTo(0, size)
    ctx.lineTo(size, 0)
    ctx.moveTo(-size * 0.5, size * 0.5)
    ctx.lineTo(size * 0.5, -size * 0.5)
    ctx.moveTo(size * 0.5, size * 1.5)
    ctx.lineTo(size * 1.5, size * 0.5)
    ctx.stroke()
    return canvas
  },
  waves: (size, color, weight) => {
    const canvas = document.createElement("canvas")
    const w = size * 2
    const h = size
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    ctx.strokeStyle = color
    ctx.lineWidth = weight
    ctx.beginPath()
    ctx.moveTo(0, h * 0.5)
    ctx.bezierCurveTo(w * 0.125, h * 0.15, w * 0.375, h * 0.15, w * 0.5, h * 0.5)
    ctx.bezierCurveTo(w * 0.625, h * 0.85, w * 0.875, h * 0.85, w, h * 0.5)
    ctx.stroke()
    return canvas
  },
}

export default function PatternCanvas({
  className = "",
  pattern = "grid",
  patternImage = null,
  tileSize = 40,
  strokeColor = "#3b82f6",
  strokeWeight = 1,
  bgColor = "#ffffff",
  scale = 1,
  interactive = true,
}) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    scale: scale,
    offsetX: 0,
    offsetY: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
  })

  // Sync external scale prop
  useEffect(() => {
    stateRef.current.scale = scale
  }, [scale])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr
      canvas.height = h * dpr
    }

    const { scale: s, offsetX, offsetY } = stateRef.current

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, w, h)

    let tileCanvas
    if (patternImage) {
      tileCanvas = patternImage
    } else {
      const generator = BUILT_IN_PATTERNS[pattern] || BUILT_IN_PATTERNS.grid
      tileCanvas = generator(tileSize, strokeColor, strokeWeight)
    }

    const pat = ctx.createPattern(tileCanvas, "repeat")
    if (!pat) return

    const mat = new DOMMatrix()
    mat.translateSelf(offsetX, offsetY)
    mat.scaleSelf(s, s)
    pat.setTransform(mat)

    ctx.fillStyle = pat
    ctx.fillRect(0, 0, w, h)
  }, [pattern, patternImage, tileSize, strokeColor, strokeWeight, bgColor])

  useEffect(() => {
    let raf
    const loop = () => {
      draw()
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [draw])

  useEffect(() => {
    if (!interactive) return
    const canvas = canvasRef.current
    if (!canvas) return

    const onWheel = (e) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const st = stateRef.current
      const oldScale = st.scale
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.max(0.1, Math.min(20, oldScale * delta))
      // Zoom toward cursor
      st.offsetX = mx - (mx - st.offsetX) * (newScale / oldScale)
      st.offsetY = my - (my - st.offsetY) * (newScale / oldScale)
      st.scale = newScale
    }

    const onPointerDown = (e) => {
      stateRef.current.dragging = true
      stateRef.current.lastX = e.clientX
      stateRef.current.lastY = e.clientY
      canvas.setPointerCapture(e.pointerId)
    }

    const onPointerMove = (e) => {
      if (!stateRef.current.dragging) return
      stateRef.current.offsetX += e.clientX - stateRef.current.lastX
      stateRef.current.offsetY += e.clientY - stateRef.current.lastY
      stateRef.current.lastX = e.clientX
      stateRef.current.lastY = e.clientY
    }

    const onPointerUp = () => {
      stateRef.current.dragging = false
    }

    canvas.addEventListener("wheel", onWheel, { passive: false })
    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointermove", onPointerMove)
    canvas.addEventListener("pointerup", onPointerUp)

    return () => {
      canvas.removeEventListener("wheel", onWheel)
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerup", onPointerUp)
    }
  }, [interactive])

  return (
    <canvas
      ref={canvasRef}
      className={`block h-full w-full touch-none ${className}`}
    />
  )
}
