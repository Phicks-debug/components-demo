import { useCallback, useEffect, useRef, useState } from "react"

export default function Pixelize({
  imageSrc,
  gradient,
  pixels = 39,
  stagger = 0.03,
  border = 0,
  aberration = 0,
  hueShift = 0,
  className,
}) {
  const canvasRef = useRef(null)
  const [img, setImg] = useState(null)
  const frameRef = useRef(null)
  const paramsRef = useRef({ pixels, stagger, border, aberration, hueShift })
  paramsRef.current = { pixels, stagger, border, aberration, hueShift }

  useEffect(() => {
    if (!imageSrc) {
      setImg(null)
      return
    }
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => setImg(image)
    image.src = imageSrc
  }, [imageSrc])

  // Static image mode
  const drawStatic = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext("2d")
    const { width, height } = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    const p = paramsRef.current
    const cols = Math.max(2, Math.round(p.pixels))
    const aspect = img.naturalWidth / img.naturalHeight
    const rows = Math.max(2, Math.round(cols / aspect))

    const offscreen = document.createElement("canvas")
    offscreen.width = cols
    offscreen.height = rows
    const offCtx = offscreen.getContext("2d")
    offCtx.drawImage(img, 0, 0, cols, rows)
    const imageData = offCtx.getImageData(0, 0, cols, rows)

    drawPixels(ctx, imageData, cols, rows, width, height, p)
  }, [img])

  // Animated gradient mode
  useEffect(() => {
    if (!gradient) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const offscreen = document.createElement("canvas")
    const offCtx = offscreen.getContext("2d")
    const startTime = performance.now()

    const render = () => {
      const { width, height } = canvas.getBoundingClientRect()
      if (width === 0 || height === 0) {
        frameRef.current = requestAnimationFrame(render)
        return
      }

      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      const p = paramsRef.current
      const cols = Math.max(2, Math.round(p.pixels))
      const canvasAspect = width / height
      const rows = Math.max(2, Math.round(cols / canvasAspect))

      // Draw animated gradient at pixel resolution
      offscreen.width = cols
      offscreen.height = rows
      const t = (performance.now() - startTime) / 1000

      drawAnimatedGradient(offCtx, cols, rows, t, gradient)

      const imageData = offCtx.getImageData(0, 0, cols, rows)
      ctx.clearRect(0, 0, width, height)
      drawPixels(ctx, imageData, cols, rows, width, height, p)

      frameRef.current = requestAnimationFrame(render)
    }

    frameRef.current = requestAnimationFrame(render)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [gradient])

  // Static image: draw on param change
  useEffect(() => {
    if (img && !gradient) drawStatic()
  }, [drawStatic, img, pixels, stagger, border, aberration, hueShift, gradient])

  // Resize handler for static mode
  useEffect(() => {
    if (gradient) return // animated mode handles its own resize
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => drawStatic())
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [drawStatic, gradient])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  )
}

function drawAnimatedGradient(ctx, w, h, time, gradient) {
  const { colors, angle = 135 } = gradient
  const n = colors.length

  // Base linear gradient with slow rotation
  const rad = ((angle + Math.sin(time * 0.3) * 20) * Math.PI) / 180
  const cx = w / 2
  const cy = h / 2
  const len = Math.max(w, h)
  const x0 = cx - Math.cos(rad) * len
  const y0 = cy - Math.sin(rad) * len
  const x1 = cx + Math.cos(rad) * len
  const y1 = cy + Math.sin(rad) * len
  const base = ctx.createLinearGradient(x0, y0, x1, y1)
  colors.forEach((c, i) => base.addColorStop(i / (n - 1), c))
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)

  // Overlay moving radial blobs for organic motion
  ctx.globalCompositeOperation = "overlay"
  for (let i = 0; i < n; i++) {
    const phase = (i / n) * Math.PI * 2
    const speed = 0.4 + i * 0.15
    const bx = cx + Math.sin(time * speed + phase) * w * 0.4
    const by = cy + Math.cos(time * speed * 0.7 + phase) * h * 0.4
    const radius = Math.max(w, h) * (0.4 + 0.15 * Math.sin(time * 0.5 + i))
    const radial = ctx.createRadialGradient(bx, by, 0, bx, by, radius)
    radial.addColorStop(0, colors[i])
    radial.addColorStop(1, "transparent")
    ctx.fillStyle = radial
    ctx.fillRect(0, 0, w, h)
  }
  ctx.globalCompositeOperation = "source-over"
}

function drawPixels(ctx, imageData, cols, rows, width, height, params) {
  const { stagger, border, aberration, hueShift } = params
  const cellW = width / cols
  const cellH = height / rows

  // Stagger: each pixel cell is split into 3 vertical slices.
  // The left slice shifts down, the right slice shifts up,
  // and the middle slice averages the two offsets.
  const sliceW = (cellW - border) / 3
  const maxShift = stagger * cellH

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const idx = (row * cols + col) * 4
      let r = imageData.data[idx]
      let g = imageData.data[idx + 1]
      let b = imageData.data[idx + 2]

      if (hueShift !== 0) {
        ;[r, g, b] = shiftHue(r, g, b, hueShift * 360)
      }

      const x = col * cellW
      const y = row * cellH
      const h = cellH - border

      // 3 slices with vertical offsets: left=down, middle=mid, right=0
      const offsets = [maxShift, maxShift * 0.5, 0]

      for (let s = 0; s < 3; s++) {
        const sx = x + s * sliceW
        let sy = y + offsets[s]
        let sh = h

        // First row: stretch slice upward to fill the gap at the top edge
        if (row === 0 && offsets[s] > 0) {
          sh += offsets[s]
          sy = 0
        }

        if (aberration !== 0) {
          const abrOffset = aberration * cellW * 0.5
          ctx.globalCompositeOperation = "screen"
          ctx.fillStyle = `rgb(${r}, 0, 0)`
          ctx.fillRect(sx - abrOffset, sy, sliceW, sh)
          ctx.fillStyle = `rgb(0, ${g}, 0)`
          ctx.fillRect(sx, sy, sliceW, sh)
          ctx.fillStyle = `rgb(0, 0, ${b})`
          ctx.fillRect(sx + abrOffset, sy, sliceW, sh)
          ctx.globalCompositeOperation = "source-over"
        } else {
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
          ctx.fillRect(sx, sy, sliceW, sh)
        }
      }
    }
  }
}

function shiftHue(r, g, b, degrees) {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h, s

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  h = ((h * 360 + degrees) % 360 + 360) % 360 / 360

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let rr, gg, bb
  if (s === 0) {
    rr = gg = bb = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    rr = hue2rgb(p, q, h + 1 / 3)
    gg = hue2rgb(p, q, h)
    bb = hue2rgb(p, q, h - 1 / 3)
  }

  return [Math.round(rr * 255), Math.round(gg * 255), Math.round(bb * 255)]
}
