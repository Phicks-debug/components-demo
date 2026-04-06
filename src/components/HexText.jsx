import { useEffect, useMemo, useRef } from "react"

export const THEMES = {
  mono: { name: "Mono", fg: "#ffffff", bg: "#000000" },
  tan: { name: "Tan", fg: "#ffffff", bg: "#d2b48c" },
  ocean: { name: "Ocean", fg: "#00e5ff", bg: "#0a1628" },
  forest: { name: "Forest", fg: "#b8e986", bg: "#0d2b0d" },
  ember: { name: "Ember", fg: "#ff6b35", bg: "#1a0a00" },
}

function createNoise() {
  const perm = new Uint8Array(512)
  for (let i = 0; i < 256; i++) perm[i] = i
  for (let i = 255; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    const tmp = perm[i]
    perm[i] = perm[j]
    perm[j] = tmp
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i]

  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10)
  const nlerp = (t, a, b) => a + t * (b - a)
  const grad = (hash, x, y, z) => {
    const h = hash & 15
    const u = h < 8 ? x : y
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }

  return (x, y, z) => {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    const Z = Math.floor(z) & 255
    x -= Math.floor(x)
    y -= Math.floor(y)
    z -= Math.floor(z)
    const u = fade(x), v = fade(y), w = fade(z)
    const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z
    const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z
    return (
      (nlerp(
        w,
        nlerp(
          v,
          nlerp(u, grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z)),
          nlerp(u, grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z)),
        ),
        nlerp(
          v,
          nlerp(u, grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1)),
          nlerp(u, grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1)),
        ),
      ) +
        1) /
      2
    )
  }
}

function textToGrid(text) {
  if (!text || !text.trim()) return null
  const c = document.createElement("canvas")
  const ctx = c.getContext("2d")
  const fontSize = 40
  ctx.font = `bold ${fontSize}px monospace`
  const m = ctx.measureText(text)
  c.width = Math.ceil(m.width) + 8
  c.height = fontSize + 8
  ctx.font = `bold ${fontSize}px monospace`
  ctx.fillStyle = "#fff"
  ctx.textBaseline = "top"
  ctx.fillText(text, 4, 4)
  const data = ctx.getImageData(0, 0, c.width, c.height)

  const step = 7
  let grid = []
  for (let y = 0; y < c.height; y += step) {
    let row = ""
    for (let x = 0; x < c.width; x += step) {
      const idx = (y * c.width + x) * 4
      row += data.data[idx + 3] > 80 ? "*" : "."
    }
    grid.push(row)
  }
  while (grid.length && !grid[0].includes("*")) grid.shift()
  while (grid.length && !grid[grid.length - 1].includes("*")) grid.pop()
  if (!grid.length) return ["...."]
  const maxLen = Math.max(...grid.map((r) => r.length))
  const pad = ".".repeat(maxLen + 4)
  grid = [pad, pad, ...grid.map((r) => ".." + r.padEnd(maxLen, ".") + ".."), pad, pad]
  return grid
}

// Pre-compute hex unit vectors once
const HEX_COS = []
const HEX_SIN = []
for (let k = 0; k < 6; k++) {
  const a = (Math.PI * 2 / 6) * k
  HEX_COS.push(Math.cos(a))
  HEX_SIN.push(Math.sin(a))
}

function makeHexTile(fillColor, strokeColor, r, lw, dpr) {
  const size = Math.ceil(r + lw + 1) * 2
  const c = document.createElement("canvas")
  c.width = Math.ceil(size * dpr)
  c.height = Math.ceil(size * dpr)
  const tx = c.getContext("2d")
  tx.scale(dpr, dpr)
  tx.translate(size / 2, size / 2)
  tx.fillStyle = fillColor
  tx.strokeStyle = strokeColor
  tx.lineWidth = lw
  tx.beginPath()
  tx.moveTo(HEX_COS[0] * r, HEX_SIN[0] * r)
  for (let k = 1; k < 6; k++) tx.lineTo(HEX_COS[k] * r, HEX_SIN[k] * r)
  tx.closePath()
  tx.fill()
  tx.stroke()
  return { canvas: c, half: size / 2, size }
}

export default function HexText({
  className = "",
  text = "",
  theme = "mono",
  speed = 1,
  hexSize = 24,
}) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const speedRef = useRef(speed)
  speedRef.current = speed

  const grid = useMemo(() => textToGrid(text), [text])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const noise = createNoise()
    const colors = THEMES[theme] || THEMES.mono

    let w, h, hexRad
    let positions = []
    let totalCols = 0, totalRows = 0
    let filled, unfilled

    function resize() {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      w = rect.width
      h = rect.height
      if (w === 0 || h === 0) return
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (grid) {
        const textCols = grid[0].length
        hexRad = Math.max(8, Math.min(w, h) / textCols / 0.75 / 2)
      } else {
        hexRad = hexSize
      }

      const r = hexRad / 2
      const lw = Math.max(1, hexRad / 15)
      filled = makeHexTile(colors.fg, colors.bg, r, lw, dpr)
      unfilled = makeHexTile(colors.bg, colors.fg, r, lw, dpr)

      // Pre-compute all grid positions and noise coordinates
      positions = []
      const xStep = hexRad * 1.5
      const yStep = hexRad / 2.3
      let count = 0
      let maxI = 0, maxJ = 0
      for (let y = 0, j = 0; y < h + hexRad; y += yStep, j++) {
        const xOff = count % 2 === 0 ? hexRad * 0.75 : 0
        for (let x = 0, i = 0; x < w + hexRad; x += xStep, i++) {
          positions.push(x + xOff, y, i, j, 10 * x / w, 5 * y / h)
          if (i > maxI) maxI = i
        }
        if (j > maxJ) maxJ = j
        count++
      }
      totalCols = maxI + 1
      totalRows = maxJ + 1
    }

    let last = performance.now()
    let t = 0

    function draw(now) {
      rafRef.current = requestAnimationFrame(draw)
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      t += dt * speedRef.current

      if (!positions.length) return

      let ox = 0, oy = 0
      if (grid && totalCols > grid[0].length && totalRows > grid.length) {
        const ww = totalCols - grid[0].length
        ox = ~~(((Math.sin(t * Math.PI / 2) + 1) / 2) * ww)
        const hh = totalRows - grid.length
        oy = ~~(((Math.sin(t / 2) + 1) / 2) * hh / 2) * 2
      }

      ctx.fillStyle = colors.bg
      ctx.fillRect(0, 0, w, h)

      const tz = t / 2
      const fCanvas = filled.canvas, uCanvas = unfilled.canvas
      const half = filled.half
      const tileSize = filled.size

      if (grid) {
        const gridRows = grid.length
        for (let k = 0; k < positions.length; k += 6) {
          const cx = positions[k]
          const cy = positions[k + 1]
          const gi = positions[k + 2] - ox
          const gj = positions[k + 3] - oy
          const ns = noise(positions[k + 4], positions[k + 5], tz)
          let isFilled = ns < 0.5

          if (gj >= 0 && gi >= 0 && gj < gridRows && gi < grid[gj].length) {
            if (grid[gj][gi] === "*") isFilled = !isFilled
          }

          ctx.drawImage(
            isFilled ? fCanvas : uCanvas,
            cx - half, cy - half, tileSize, tileSize,
          )
        }
      } else {
        for (let k = 0; k < positions.length; k += 6) {
          const ns = noise(positions[k + 4], positions[k + 5], tz)
          ctx.drawImage(
            ns < 0.5 ? fCanvas : uCanvas,
            positions[k] - half, positions[k + 1] - half, tileSize, tileSize,
          )
        }
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [grid, theme, hexSize])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  )
}
