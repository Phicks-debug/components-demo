import { useEffect, useRef } from "react"

const CHARSETS = {
  latin: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  thai: "กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮ",
  mixed:
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮ",
  katakana: "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン",
  blocks: "█▓▒░▄▀■□▪▫▬▮▯",
  symbols: "!@#$%^&*()+-=[]{}|;:,.<>?/~`",
  digits: "0123456789",
}

export default function WarholType({
  imageSrc,
  fontSize = 12,
  charset = "mixed",
  fontFamily = "monospace",
  scrambleSpeed = 6,
  className,
}) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    img: null,
    charGrid: null,
    frameCount: 0,
  })
  const propsRef = useRef({ fontSize, charset, fontFamily, scrambleSpeed })
  propsRef.current = { fontSize, charset, fontFamily, scrambleSpeed }

  // Load image
  useEffect(() => {
    if (!imageSrc) return
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => {
      stateRef.current.img = image
      stateRef.current.charGrid = null
    }
    image.src = imageSrc
  }, [imageSrc])

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const offscreen = document.createElement("canvas")
    const offCtx = offscreen.getContext("2d")
    let raf

    const render = () => {
      const { width, height } = canvas.getBoundingClientRect()
      if (width === 0 || height === 0) {
        raf = requestAnimationFrame(render)
        return
      }

      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      const { img } = stateRef.current
      if (!img) {
        ctx.fillStyle = "#000"
        ctx.fillRect(0, 0, width, height)
        raf = requestAnimationFrame(render)
        return
      }

      const p = propsRef.current
      const fs = Math.max(4, p.fontSize)
      const chars = CHARSETS[p.charset] || CHARSETS.mixed

      // Calculate grid dimensions
      const cols = Math.floor(width / (fs * 0.6))
      const rows = Math.floor(height / fs)
      if (cols < 1 || rows < 1) {
        raf = requestAnimationFrame(render)
        return
      }

      // Sample image at grid resolution
      offscreen.width = cols
      offscreen.height = rows
      offCtx.drawImage(img, 0, 0, cols, rows)
      const imageData = offCtx.getImageData(0, 0, cols, rows)

      // Build or refresh character grid
      const grid = stateRef.current.charGrid
      const needsNew = !grid || grid.length !== rows || grid[0]?.length !== cols

      if (needsNew) {
        stateRef.current.charGrid = Array.from({ length: rows }, () =>
          Array.from({ length: cols }, () => chars[Math.floor(Math.random() * chars.length)])
        )
      }

      // Scramble some characters each frame
      const charGrid = stateRef.current.charGrid
      stateRef.current.frameCount++

      if (p.scrambleSpeed > 0 && stateRef.current.frameCount % Math.max(1, Math.round(10 - p.scrambleSpeed)) === 0) {
        const count = Math.floor(cols * rows * 0.08)
        for (let i = 0; i < count; i++) {
          const r = Math.floor(Math.random() * rows)
          const c = Math.floor(Math.random() * cols)
          charGrid[r][c] = chars[Math.floor(Math.random() * chars.length)]
        }
      }

      // Draw
      ctx.fillStyle = "#000"
      ctx.fillRect(0, 0, width, height)
      ctx.font = `${fs}px ${p.fontFamily}`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const cellW = fs * 0.6
      const cellH = fs

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = (row * cols + col) * 4
          const r = imageData.data[idx]
          const g = imageData.data[idx + 1]
          const b = imageData.data[idx + 2]

          ctx.fillStyle = `rgb(${r},${g},${b})`
          ctx.fillText(
            charGrid[row][col],
            col * cellW + cellW / 2,
            row * cellH + cellH / 2
          )
        }
      }

      raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  )
}

export { CHARSETS }
