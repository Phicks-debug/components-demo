import { useCallback, useEffect, useRef } from "react"

const MARGIN = 200

function randomAngle() {
  return Math.random() * Math.PI * 2
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function spawnParticle(w, h, randomize, fromEdge) {
  const angle = randomAngle()
  const depth = Math.random()
  const baseSpd = 0.3 + depth * 3.5

  let x, y
  if (fromEdge) {
    const edge = Math.floor(Math.random() * 4)
    if (edge === 0) { x = -MARGIN * Math.random(); y = Math.random() * h }
    else if (edge === 1) { x = w + MARGIN * Math.random(); y = Math.random() * h }
    else if (edge === 2) { x = Math.random() * w; y = -MARGIN * Math.random() }
    else { x = Math.random() * w; y = h + MARGIN * Math.random() }
  } else {
    x = Math.random() * w
    y = Math.random() * h
  }

  return {
    x,
    y,
    vx: Math.cos(angle) * baseSpd,
    vy: Math.sin(angle) * baseSpd,
    depth,
    life: 0,
    maxLife: 2 + Math.random() * 5,
    baseBright: randomize ? 0.3 + Math.random() * 0.7 : 1,
    blinkPhase: Math.random() * Math.PI * 2,
    blinkSpeed: 0.8 + Math.random() * 3,
  }
}

export default function Particles({
  className = "",
  background = "#000000",
  color = "#ffffff",
  warp = false,
  randomize = true,
  speed = 3.6,
  scale = 1.8,
  brightness = 0.14,
  size = 0.76,
  blink = false,
  count = 100,
}) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafRef = useRef(null)
  const timeRef = useRef(0)
  const propsRef = useRef({ background, color, warp, randomize, speed, scale, brightness, size, blink, count })

  propsRef.current = { background, color, warp, randomize, speed, scale, brightness, size, blink, count }

  const init = useCallback((w, h, n) => {
    particlesRef.current = Array.from({ length: n }, () =>
      spawnParticle(w, h, randomize, false),
    )
    for (const p of particlesRef.current) {
      p.life = Math.random() * p.maxLife
    }
  }, [randomize])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    let w, h

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (particlesRef.current.length === 0) init(w, h, propsRef.current.count)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let last = performance.now()

    const frame = (now) => {
      rafRef.current = requestAnimationFrame(frame)
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      timeRef.current += dt

      const t = timeRef.current
      const P = propsRef.current
      const spd = P.speed * 50
      const cx = w / 2
      const cy = h / 2
      const [cr, cg, cb] = hexToRgb(P.color)

      ctx.fillStyle = P.background
      ctx.fillRect(0, 0, w, h)

      // Dynamically adjust particle count
      const pts = particlesRef.current
      while (pts.length < P.count) {
        const np = spawnParticle(w, h, P.randomize, true)
        np.life = 0
        pts.push(np)
      }
      while (pts.length > P.count) pts.pop()

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]
        p.life += dt

        const oob =
          p.x < -MARGIN || p.x > w + MARGIN ||
          p.y < -MARGIN || p.y > h + MARGIN
        if (p.life > p.maxLife || oob) {
          pts[i] = spawnParticle(w, h, P.randomize, true)
          pts[i].life = 0
          continue
        }

        const depthSpeed = 0.1 + p.depth * 0.9
        let mx = p.vx * spd * depthSpeed
        let my = p.vy * spd * depthSpeed

        if (P.warp) {
          const ox = p.x - cx
          const oy = p.y - cy
          const dist = Math.sqrt(ox * ox + oy * oy) + 0.1
          const pull = P.speed * 120 * depthSpeed / dist
          mx += (ox / dist) * pull
          my += (oy / dist) * pull
        }

        p.x += mx * dt
        p.y += my * dt

        // Fade in/out
        const fadeIn = Math.min(1, p.life / 0.4)
        const fadeOut = Math.min(1, (p.maxLife - p.life) / 0.4)
        let fade = fadeIn * fadeOut * p.baseBright

        if (P.blink) {
          fade *= 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * p.blinkSpeed + p.blinkPhase))
        }

        // Depth drives size: close = big, far = tiny
        const depthSize = 0.15 + p.depth * 0.85
        const r = depthSize * P.size * P.scale * 5
        // Brightness controls glow radius/intensity, not color shift
        const depthAlpha = 0.3 + p.depth * 0.7
        const glowAlpha = Math.min(1, P.brightness * 2 * fade * depthAlpha)
        const coreAlpha = Math.min(1, fade * depthAlpha * (0.5 + P.brightness * 1.5))
        if (coreAlpha < 0.005) continue

        // Glow — brightness scales the glow spread
        const gr = r * (1.2 + P.brightness * 2)
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gr)
        grad.addColorStop(0, `rgba(${cr},${cg},${cb},${glowAlpha})`)
        grad.addColorStop(0.35, `rgba(${cr},${cg},${cb},${glowAlpha * 0.2})`)
        grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`)

        ctx.beginPath()
        ctx.arc(p.x, p.y, gr, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // Core dot — always solid color
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(0.3, r * 0.35), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${coreAlpha})`
        ctx.fill()
      }
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [init])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    init(rect.width, rect.height, propsRef.current.count)
  }, [randomize, init])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  )
}
