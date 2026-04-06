import { useEffect, useRef } from "react"

const PI = Math.PI
const HALF_PI = PI / 2

export const PALETTES = [
  { name: "Sunset", label: "Orange #FF8C00 + Rose #DB707B", c1: "#FF8C00BF", c2: "#DB707BBC" },
  { name: "Harvest", label: "Olive #AF8C00 + Lime #DBDE7B", c1: "#AF8C00BF", c2: "#DBDE7BBC" },
  { name: "Deep Sea", label: "Navy #010972 + Lavender #7F7ADE", c1: "#010972BF", c2: "#7F7ADEBC" },
  { name: "Mono", label: "Black #000000 + Grey #AAAAAA", c1: "#000000BF", c2: "#AAAAAABC" },
]

function lerp(a, b, t) {
  return a + (b - a) * t
}

export default function BauhausGrid({
  className = "",
  paletteIndex = 0,
  gridSize = 15,
  speed = 0.2,
  flipInterval = 150,
}) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")

    const palette = PALETTES[paletteIndex] || PALETTES[0]
    let w, h, dim, ox, oy
    let cells = []
    let mode = 0
    let frameCount = 0

    function flipEverything() {
      mode = (mode + 1) % 32
      const bin = mode.toString(2).padStart(5, "0")

      if (parseInt(bin[4], 10) % 2 === 0) {
        for (const c of cells) {
          c.tang =
            (parseInt(bin[3], 10) * c.id) / (2 - parseInt(bin[0], 10))
          c.tshift1 = parseInt(bin[2], 10)
          c.tshift2 = parseInt(bin[1], 10)
        }
      } else {
        for (const c of cells) {
          c.tang = Math.floor(Math.random() * 2)
          c.tshift1 = Math.floor(Math.random() * 2)
          c.tshift2 = Math.floor(Math.random() * 2)
        }
      }
      frameCount = 0
    }

    function buildCells() {
      cells = []
      for (let col = 0; col < gridSize; col++) {
        for (let row = 0; row < gridSize; row++) {
          cells.push({
            x: col * dim + dim / 2,
            y: row * dim + dim / 2,
            ang: 0,
            tang: 0,
            shift1: 0,
            tshift1: 0,
            shift2: 0,
            tshift2: 0,
            id: (col + row) * 2,
          })
        }
      }
      mode = 0
      frameCount = 0
      flipEverything()
    }

    function resize() {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const size = Math.min(w, h)
      dim = Math.floor(size / gridSize)
      ox = (w - dim * gridSize) / 2
      oy = (h - dim * gridSize) / 2

      buildCells()
    }

    function drawCell(cell) {
      ctx.save()
      ctx.translate(ox + cell.x, oy + cell.y)
      ctx.rotate(cell.ang * HALF_PI)

      ctx.save()
      ctx.translate(0, cell.shift1 * dim / 2)
      ctx.rotate(cell.shift1 * PI)
      ctx.fillStyle = palette.c1
      ctx.beginPath()
      ctx.arc(0, 0, dim / 2, 0, PI)
      ctx.fill()
      ctx.restore()

      ctx.save()
      ctx.translate(0, (cell.shift2 - 1) * dim / 2)
      ctx.rotate(cell.shift2 * PI)
      ctx.fillStyle = palette.c2
      ctx.beginPath()
      ctx.arc(0, 0, dim / 2, 0, PI)
      ctx.fill()
      ctx.restore()

      ctx.restore()
    }

    function draw() {
      rafRef.current = requestAnimationFrame(draw)
      frameCount++

      ctx.clearRect(0, 0, w, h)

      for (const c of cells) {
        if (frameCount > c.id) {
          c.ang = lerp(c.ang, c.tang, speed)
          c.shift1 = lerp(c.shift1, c.tshift1, speed)
          c.shift2 = lerp(c.shift2, c.tshift2, speed)
        }
        drawCell(c)
      }

      if (frameCount % flipInterval === 0) flipEverything()
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [paletteIndex, gridSize, speed, flipInterval])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  )
}
