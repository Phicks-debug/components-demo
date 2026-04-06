import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

const VERTEX_SHADER = `#version 300 es
out vec2 vUv;

const vec4 positions[6] = vec4[](
    vec4(-1.0, -1.0, 0.0, 1.0),
    vec4( 3.0, -1.0, 0.0, 1.0),
    vec4(-1.0,  3.0, 0.0, 1.0),
    vec4(-1.0, -1.0, 0.0, 1.0),
    vec4( 3.0, -1.0, 0.0, 1.0),
    vec4(-1.0,  3.0, 0.0, 1.0)
);

void main() {
    gl_Position = positions[gl_VertexID];
    vUv = gl_Position.xy * 0.5 + 0.5;
}`

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_color4;
uniform float u_speed;
uniform float u_warp;
uniform float u_scale;

// --- Simplex 3D noise ---
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// FBM with rotation between octaves
float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; i++) {
        value += amplitude * snoise(p * frequency);
        p.xy = rot * p.xy;
        p.yz = rot * p.yz;
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 uv = vUv;
    float aspect = u_resolution.x / u_resolution.y;
    uv.x *= aspect;

    float t = u_time * u_speed;
    float scale = u_scale;
    float warpStrength = u_warp;

    vec3 p = vec3(uv * scale, t * 0.15);

    // Domain warping — feed noise back into itself for liquid distortion
    float warp1x = fbm(p + vec3(0.0, 0.0, 0.0));
    float warp1y = fbm(p + vec3(5.2, 1.3, 0.0));
    vec3 p2 = p + warpStrength * vec3(warp1x, warp1y, 0.0);

    float warp2x = fbm(p2 + vec3(1.7, 9.2, t * 0.1));
    float warp2y = fbm(p2 + vec3(8.3, 2.8, t * 0.08));
    vec3 p3 = p + warpStrength * vec3(warp2x, warp2y, 0.0);

    // Third warp pass for extra liquidity
    float warp3x = fbm(p3 + vec3(3.1, 6.7, t * 0.06));
    float warp3y = fbm(p3 + vec3(7.9, 4.2, t * 0.12));
    vec3 p4 = p + warpStrength * 0.8 * vec3(warp3x, warp3y, 0.0);

    float n = fbm(p4);

    // Map noise to [0, 1]
    float v = n * 0.5 + 0.5;

    // Create smooth blending zones between colors
    // Use the warped noise layers as additional blend factors
    float blend1 = smoothstep(0.0, 1.0, warp2x * 0.5 + 0.5);
    float blend2 = smoothstep(0.0, 1.0, warp3y * 0.5 + 0.5);

    // Four-color blending using noise-driven interpolation
    vec3 colorA = mix(u_color1, u_color2, v);
    vec3 colorB = mix(u_color3, u_color4, v);
    vec3 color = mix(colorA, colorB, blend1);

    // Add iridescent shimmer from the third warp layer
    float shimmer = warp3x * 0.5 + 0.5;
    color = mix(color, mix(u_color2, u_color3, shimmer), blend2 * 0.4);

    // Slight contrast boost for that liquid metallic look
    color = smoothstep(0.0, 1.0, color);

    fragColor = vec4(color, 1.0);
}`

export const PALETTES = {
  holographic: {
    color1: [0.95, 0.85, 0.55],
    color2: [0.45, 0.55, 1.0],
    color3: [0.85, 0.65, 0.9],
    color4: [0.05, 0.05, 0.2],
  },
  aurora: {
    color1: [0.1, 0.9, 0.6],
    color2: [0.3, 0.2, 0.8],
    color3: [0.0, 0.5, 0.9],
    color4: [0.0, 0.05, 0.15],
  },
  lava: {
    color1: [1.0, 0.35, 0.1],
    color2: [1.0, 0.85, 0.2],
    color3: [0.6, 0.05, 0.05],
    color4: [0.15, 0.02, 0.02],
  },
  ocean: {
    color1: [0.2, 0.7, 0.85],
    color2: [0.05, 0.2, 0.6],
    color3: [0.5, 0.9, 0.95],
    color4: [0.01, 0.05, 0.15],
  },
  sunset: {
    color1: [1.0, 0.6, 0.3],
    color2: [0.85, 0.25, 0.5],
    color3: [0.4, 0.15, 0.6],
    color4: [0.05, 0.02, 0.1],
  },
  mint: {
    color1: [0.6, 1.0, 0.85],
    color2: [0.2, 0.5, 0.45],
    color3: [0.85, 1.0, 0.7],
    color4: [0.05, 0.15, 0.1],
  },
  neon: {
    color1: [0.0, 1.0, 0.8],
    color2: [1.0, 0.0, 0.6],
    color3: [0.2, 0.4, 1.0],
    color4: [0.0, 0.0, 0.05],
  },
  pearl: {
    color1: [0.95, 0.92, 0.88],
    color2: [0.75, 0.8, 0.9],
    color3: [0.9, 0.82, 0.85],
    color4: [0.55, 0.58, 0.65],
  },
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export default function LiquidGradient({
  palette = PALETTES.holographic,
  speed = 1,
  warp = 1.2,
  scale = 2.5,
  className,
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const paletteRef = useRef(palette)
  const speedRef = useRef(speed)
  const warpRef = useRef(warp)
  const scaleRef = useRef(scale)
  const [isSupported, setIsSupported] = useState(true)
  const [isReady, setIsReady] = useState(false)

  paletteRef.current = palette
  speedRef.current = speed
  warpRef.current = warp
  scaleRef.current = scale

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true })
    if (!gl) { setIsSupported(false); return }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    if (!vs || !fs) return

    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program))
      return
    }

    gl.useProgram(program)

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    const uniforms = {}
    const uniformNames = [
      "u_time", "u_resolution", "u_color1", "u_color2",
      "u_color3", "u_color4", "u_speed", "u_warp", "u_scale",
    ]
    for (const name of uniformNames) {
      uniforms[name] = gl.getUniformLocation(program, name)
    }

    const sizeRef = { width: 0, height: 0 }
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (!rect) return
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      sizeRef.width = canvas.width
      sizeRef.height = canvas.height
    })
    observer.observe(container)

    setIsReady(true)

    let animTime = 0
    let lastTime = performance.now()
    let frameId

    const render = () => {
      const now = performance.now()
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now
      animTime += dt * speedRef.current

      const { width, height } = sizeRef
      if (width > 0 && height > 0) {
        gl.viewport(0, 0, width, height)
        gl.clear(gl.COLOR_BUFFER_BIT)

        const c = paletteRef.current
        gl.uniform1f(uniforms.u_time, animTime)
        gl.uniform2fv(uniforms.u_resolution, [width, height])
        gl.uniform3fv(uniforms.u_color1, c.color1)
        gl.uniform3fv(uniforms.u_color2, c.color2)
        gl.uniform3fv(uniforms.u_color3, c.color3)
        gl.uniform3fv(uniforms.u_color4, c.color4)
        gl.uniform1f(uniforms.u_speed, speedRef.current)
        gl.uniform1f(uniforms.u_warp, warpRef.current)
        gl.uniform1f(uniforms.u_scale, scaleRef.current)

        gl.drawArrays(gl.TRIANGLES, 0, 6)
      }

      frameId = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      gl.deleteVertexArray(vao)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [])

  return (
    <div ref={containerRef} className={cn("relative h-full w-full", className)}>
      {isSupported ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ opacity: isReady ? 1 : 0, transition: "opacity 240ms ease-out" }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
          WebGL2 not supported in this browser.
        </div>
      )}
    </div>
  )
}
