import { forwardRef, useCallback, useImperativeHandle, useRef } from "react"

const COLORS = [
  { r: 38, g: 204, b: 255 },
  { r: 162, g: 90, b: 253 },
  { r: 255, g: 94, b: 126 },
  { r: 136, g: 255, b: 90 },
  { r: 252, g: 255, b: 66 },
  { r: 255, g: 166, b: 45 },
  { r: 255, g: 54, b: 255 },
]

function createParticle(cx, cy, startVelocity, spread) {
  const angleRad = (90 * Math.PI) / 180
  const spreadRad = (spread * Math.PI) / 180

  return {
    x: cx,
    y: cy,
    wobble: Math.random() * 10,
    wobbleSpeed: Math.min(0.11, Math.random() * 0.1 + 0.05),
    velocity: startVelocity + Math.random() * startVelocity,
    angle2D: -angleRad + (0.5 * spreadRad - Math.random() * spreadRad),
    tiltAngle: (Math.random() * 0.5 + 0.25) * Math.PI,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    tick: 0,
    random: Math.random() + 2,
    tiltSin: 0,
    tiltCos: 0,
    wobbleX: 0,
    wobbleY: 0,
  }
}

function updateParticle(ctx, p, gravity, decay, totalTicks, dt) {
  // dt-scaled step count (1.0 at 60fps)
  const step = dt * 60

  // Ballistic trajectory
  p.x += Math.cos(p.angle2D) * p.velocity * step
  p.y += Math.sin(p.angle2D) * p.velocity * step + gravity * 3 * step
  p.velocity *= Math.pow(decay, step)

  // Flutter wobble
  p.wobble += p.wobbleSpeed * step
  p.wobbleX = p.x + 10 * Math.cos(p.wobble)
  p.wobbleY = p.y + 10 * Math.sin(p.wobble)

  // 3D tumble
  p.tiltAngle += 0.1 * step
  p.tiltSin = Math.sin(p.tiltAngle)
  p.tiltCos = Math.cos(p.tiltAngle)
  p.random = Math.random() + 2

  p.tick += step
  const progress = p.tick / totalTicks

  // Four-point quad for 3D confetti shape
  const x1 = p.x + p.random * p.tiltCos
  const y1 = p.y + p.random * p.tiltSin
  const x2 = p.wobbleX + p.random * p.tiltCos
  const y2 = p.wobbleY + p.random * p.tiltSin

  ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${1 - progress})`
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(p.wobbleX, y1)
  ctx.lineTo(x2, y2)
  ctx.lineTo(p.x, y2)
  ctx.closePath()
  ctx.fill()

  return p.tick < totalTicks
}

const Confetti = forwardRef(function Confetti(
  {
    particleCount = 195,
    startVelocity = 31,
    spread = 107,
    decay = 0.92,
    gravity = 1.2,
    duration = 3.6,
    className = "",
  },
  ref,
) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const particlesRef = useRef([])
  const prevRef = useRef(0)

  const startLoop = useCallback(() => {
    if (animRef.current) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const rect = canvas.getBoundingClientRect()

    prevRef.current = performance.now()

    function loop(now) {
      const dt = Math.min((now - prevRef.current) / 1000, 0.05)
      prevRef.current = now

      ctx.clearRect(0, 0, rect.width, rect.height)

      particlesRef.current = particlesRef.current.filter((p) =>
        updateParticle(ctx, p, gravity, decay, p.totalTicks, dt),
      )

      if (particlesRef.current.length) {
        animRef.current = requestAnimationFrame(loop)
      } else {
        animRef.current = null
      }
    }

    animRef.current = requestAnimationFrame(loop)
  }, [gravity, decay])

  const fire = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.getContext("2d").scale(dpr, dpr)

    const cx = rect.width / 2
    const cy = rect.height / 2
    const totalTicks = Math.round(duration * 60)

    for (let i = 0; i < particleCount; i++) {
      const p = createParticle(cx, cy, startVelocity, spread)
      p.totalTicks = totalTicks
      particlesRef.current.push(p)
    }

    startLoop()
  }, [particleCount, startVelocity, spread, duration, startLoop])

  useImperativeHandle(ref, () => ({ fire }), [fire])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  )
})

export default Confetti
