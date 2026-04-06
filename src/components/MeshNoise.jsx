import { useEffect, useMemo, useRef } from "react"

// --- Seeded Perlin Noise ---
function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10) }
function lerp(t, a, b) { return a + t * (b - a) }
function grad2D(hash, x, y) {
  const h = hash & 3
  return ((h & 1) === 0 ? x : -x) + ((h & 2) === 0 ? y : -y)
}

function createNoise(seed) {
  const perm = new Uint8Array(512)
  let s = seed | 0
  const rng = () => {
    s = s + 0x6D2B79F5 | 0
    let t = Math.imul(s ^ s >>> 15, 1 | s)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
  const p = new Uint8Array(256)
  for (let i = 0; i < 256; i++) p[i] = i
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = p[i]; p[i] = p[j]; p[j] = tmp
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]

  return (x, y) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255
    const xf = x - Math.floor(x), yf = y - Math.floor(y)
    const u = fade(xf), v = fade(yf)
    const A = perm[X] + Y, B = perm[X + 1] + Y
    return lerp(v,
      lerp(u, grad2D(perm[A], xf, yf), grad2D(perm[B], xf - 1, yf)),
      lerp(u, grad2D(perm[A + 1], xf, yf - 1), grad2D(perm[B + 1], xf - 1, yf - 1))
    )
  }
}

function fbm(noiseFn, x, y, octaves = 3) {
  let val = 0, amp = 1, freq = 1, max = 0
  for (let i = 0; i < octaves; i++) {
    val += noiseFn(x * freq, y * freq) * amp
    max += amp
    amp *= 0.5
    freq *= 2
  }
  return val / max
}

export default function MeshNoise({
  fill = "#000000",
  lineColor = "#ffffff",
  lineWidth = 0.1,
  lineBlur = 2,
  seed = 115,
  speed = 0.5,
  amplitude = 0.2,
  tilt = -43,
  zoom = 0.35,
  height = 2,
  brightness = 3,
  className = "",
}) {
  const wrapperRef = useRef(null)
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const propsRef = useRef()
  propsRef.current = { fill, lineColor, lineWidth, lineBlur, speed, amplitude, zoom, height, brightness }

  const noiseFn = useMemo(() => createNoise(seed), [seed])

  useEffect(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!canvas || !wrapper) return
    const ctx = canvas.getContext("2d")
    let w, h, dpr

    const resize = () => {
      dpr = window.devicePixelRatio || 1
      w = wrapper.offsetWidth
      h = wrapper.offsetHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrapper)

    const draw = (now) => {
      const p = propsRef.current
      const t = now * 0.001 * p.speed

      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Fill background
      ctx.fillStyle = p.fill
      ctx.fillRect(0, 0, w, h)

      // Noise sampling frequency
      const freq = (p.zoom + 0.3) * 3
      // Max vertical displacement per line
      const maxDisp = p.amplitude * p.height * h * 0.12
      // Lines scroll through the noise field over time
      const scroll = t * 0.04

      const numLines = 80

      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.strokeStyle = p.lineColor

      for (let i = -4; i < numLines + 4; i++) {
        // Each line has a position in [0,1) that wraps as it scrolls
        const raw = i / numLines + scroll
        const pos = ((raw % 1) + 1) % 1
        const screenY = pos * h

        if (screenY < -maxDisp * 2 || screenY > h + maxDisp * 2) continue

        // Sample noise at screen coordinates — noise field is static
        const ny = screenY / h

        ctx.beginPath()
        for (let px = 0; px <= w; px += 2) {
          const nx = px / w
          const n = fbm(noiseFn, nx * freq, ny * freq, 3)
          const y = screenY + n * maxDisp
          if (px === 0) ctx.moveTo(px, y)
          else ctx.lineTo(px, y)
        }

        ctx.globalAlpha = Math.min(1, p.brightness * 0.28)
        ctx.lineWidth = Math.max(0.3, p.lineWidth * 6)

        if (p.lineBlur > 0) {
          ctx.shadowColor = p.lineColor
          ctx.shadowBlur = p.lineBlur * p.brightness * 0.8
        } else {
          ctx.shadowBlur = 0
        }

        ctx.stroke()
      }

      ctx.globalAlpha = 1
      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
    }
  }, [noiseFn])

  // Tilt = CSS 3D perspective rotation (viewing angle)
  const rotateX = -tilt * 0.75
  const scale = 1 + Math.abs(rotateX) / 55

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{ perspective: "600px", overflow: "hidden" }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          transform: `rotateX(${rotateX}deg) scale(${scale})`,
          transformOrigin: "center center",
        }}
      />
    </div>
  )
}
