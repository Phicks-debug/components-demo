import { useCallback, useEffect, useRef } from "react"

const COLS = 24
const ROWS = 20
const LINE_LENGTH = 15
const LINE_WIDTH = 2
const OFFSET_X = 40
const OFFSET_Y = -40

export default function PointerField({ className }) {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const rafRef = useRef(null)
  const sizeRef = useRef({ w: 0, h: 0 })
  const anglesRef = useRef(
    Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      canvas.width = width * dpr
      canvas.height = height * dpr
      sizeRef.current = { w: width, h: height }
    })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const { w, h } = sizeRef.current
    if (w === 0 || h === 0) { rafRef.current = requestAnimationFrame(draw); return }
    const dpr = window.devicePixelRatio || 1

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const cellW = w / COLS
    const cellH = h / ROWS
    const mx = mouseRef.current.x + OFFSET_X
    const my = mouseRef.current.y + OFFSET_Y

    ctx.clearRect(0, 0, w, h)
    ctx.strokeStyle = getComputedStyle(canvas).color || "rgba(255,255,255,0.85)"
    ctx.lineWidth = LINE_WIDTH
    ctx.lineCap = "round"

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cx = cellW * (col + 0.5)
        const cy = cellH * (row + 0.5)

        const target = Math.atan2(my - cy, mx - cx)
        // smooth interpolation
        let current = anglesRef.current[row][col]
        let diff = target - current
        // normalize to [-PI, PI]
        diff = Math.atan2(Math.sin(diff), Math.cos(diff))
        current += diff * 0.15
        anglesRef.current[row][col] = current

        const half = LINE_LENGTH / 2
        const dx = Math.cos(current) * half
        const dy = Math.sin(current) * half

        ctx.beginPath()
        ctx.moveTo(cx - dx, cy - dy)
        ctx.lineTo(cx + dx, cy + dy)
        ctx.stroke()
      }
    }

    rafRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [draw])

  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  )
}
