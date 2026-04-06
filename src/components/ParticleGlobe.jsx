import { useCallback, useEffect, useRef } from "react"

export default function ParticleGlobe({
  className = "",
  particleCount = 8000,
  radius = 0,
  repelRadius = 90,
  repelStrength = 28,
  attraction = 0.01,
  damping = 0.9,
  speed = 1,
  color = "#ffffff",
  background = "#000000",
}) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const speedRef = useRef(speed)
  speedRef.current = speed

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")

    let w, h, r
    let angle = 0
    const particles = []

    function init() {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      r = radius || Math.min(w, h) * 0.35

      particles.length = 0
      angle = 0
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          index: i,
          x: Math.sin(i) * Math.sin(i * i) * r,
          y: Math.cos(i * i) * r,
          vx: 0,
          vy: 0,
        })
      }
    }

    let last = performance.now()

    function draw(now) {
      rafRef.current = requestAnimationFrame(draw)
      const dt = Math.min((now - last) / 1000, 0.1) * 60 // normalize to 60fps baseline
      last = now
      const spd = speedRef.current

      const cx = w / 2
      const cy = h / 2
      const mx = mouseRef.current.x - cx
      const my = mouseRef.current.y - cy
      const rr2 = repelRadius * repelRadius

      ctx.fillStyle = background
      ctx.fillRect(0, 0, w, h)

      ctx.fillStyle = color
      ctx.beginPath()

      for (const p of particles) {
        const i = p.index

        // Rotating home position
        const homeX = Math.sin(i + angle) * Math.sin(i * i) * r
        const homeY = Math.cos(i * i) * r

        // Spring toward home
        p.vx += (homeX - p.x) * attraction * dt
        p.vy += (homeY - p.y) * attraction * dt

        // Mouse repulsion
        const awayX = p.x - mx
        const awayY = p.y - my
        const distSq = awayX * awayX + awayY * awayY
        if (distSq > 0.1 && distSq < rr2) {
          const dist = Math.sqrt(distSq)
          const repel = repelStrength * (1 - dist / repelRadius) / dist * dt
          p.vx += awayX * repel
          p.vy += awayY * repel
        }

        // Damping and move
        const d = Math.pow(damping, dt)
        p.vx *= d
        p.vy *= d
        p.x += p.vx * dt
        p.y += p.vy * dt

        ctx.rect(cx + p.x - 1, cy + p.y - 1, 2, 2)
      }

      ctx.fill()
      angle += 0.01 * dt * spd
    }

    init()
    const ro = new ResizeObserver(init)
    ro.observe(canvas)
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [particleCount, radius, repelRadius, repelStrength, attraction, damping, color, background, speed])

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseRef.current.x = e.clientX - rect.left
    mouseRef.current.y = e.clientY - rect.top
  }, [])

  const handleTouchMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const touch = e.touches[0]
    if (touch) {
      mouseRef.current.x = touch.clientX - rect.left
      mouseRef.current.y = touch.clientY - rect.top
    }
  }, [])

  const handleLeave = useCallback(() => {
    mouseRef.current.x = -9999
    mouseRef.current.y = -9999
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleLeave}
    />
  )
}
