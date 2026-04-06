import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

const VERTEX_SHADER = `#version 300 es
out vec2 out_uv;

const vec4 positions[6] = vec4[](
    vec4(-1.0, -1.0, 0.0, 1.0),
    vec4(3.0, -1.0, 0.0, 1.0),
    vec4(-1.0, 3.0, 0.0, 1.0),
    vec4(-1.0, -1.0, 0.0, 1.0),
    vec4(3.0, -1.0, 0.0, 1.0),
    vec4(-1.0, 3.0, 0.0, 1.0)
);

void main() {
    gl_Position = positions[gl_VertexID];
    out_uv = gl_Position.xy * 0.5 + 0.5;
    out_uv.y = 1.0 - out_uv.y;
}`

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 out_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_viewport;
uniform vec3 u_color1; // top-left
uniform vec3 u_color2; // bottom-left
uniform vec3 u_color3; // bottom-right
uniform vec3 u_color4; // top-right
uniform vec3 u_color5; // center

// --- 3D Simplex Noise (Ashima Arts / Stefan Gustavson) ---
vec3 mod289v3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289v4(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289v4(((x * 34.0) + 10.0) * x); }
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

    i = mod289v3(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
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

void main() {
    vec2 uv = out_uv;
    float aspect = u_viewport.x / u_viewport.y;
    vec2 st = vec2(uv.x * aspect, uv.y);
    float t = u_time;

    // Rotated coordinates for anisotropic noise
    float ang = 0.52;
    float ca = cos(ang), sa = sin(ang);
    vec2 rst = vec2(st.x * ca + st.y * sa, -st.x * sa + st.y * ca);

    // Highly anisotropic noise — very elongated for ribbon-like bands
    float n1 = snoise(vec3(rst.x * 2.2, rst.y * 0.25, t * 0.20));
    // Gentle domain warp keeps bands flowing organically
    float n2 = snoise(vec3(
        rst.x * 2.2 + n1 * 0.8,
        rst.y * 0.25 + n1 * 0.15,
        t * 0.16 + 5.0
    ));

    // Smooth diagonal displacement — broad flowing ribbons
    vec2 duv = uv;
    duv.x += n2 * 0.40 * ca;
    duv.y -= n2 * 0.40 * sa;

    // 2D gradient: top/bottom color separation
    float mx = smoothstep(0.0, 1.0, duv.x);
    // Bias vertical blend so top colors (lavender/pink) get more area
    float my = smoothstep(-0.15, 0.85, duv.y);

    // Top: lavender → pink, Bottom: amber → coral
    vec3 topColor = mix(u_color1, u_color4, mx);
    vec3 botColor = mix(u_color2, u_color3, mx);
    vec3 color = mix(topColor, botColor, my);

    // 5th color — subtle center accent
    float cx = smoothstep(0.0, 0.5, duv.x) * smoothstep(1.0, 0.5, duv.x);
    float cy = smoothstep(0.0, 0.5, duv.y) * smoothstep(1.0, 0.5, duv.y);
    float center = cx * cy * 2.5;
    color = mix(color, u_color5, center * 0.3);

    fragColor = vec4(color, 1.0);
}`

export const THEMES = {
  sunset: {
    color1: [0.42, 0.42, 0.95],  // deep indigo-blue (top-left)
    color2: [1.00, 0.88, 0.10],  // vivid yellow (bottom-left)
    color3: [0.98, 0.30, 0.18],  // bright vermillion (bottom-right)
    color4: [0.92, 0.25, 0.85],  // electric purple-pink (top-right)
    color5: [0.98, 0.60, 0.10],  // deep amber (center)
  },
  ocean: {
    color1: [0.55, 0.78, 0.95],
    color2: [0.10, 0.30, 0.60],
    color3: [0.08, 0.52, 0.68],
    color4: [0.18, 0.58, 0.86],
    color5: [0.15, 0.72, 0.82],
  },
  aurora: {
    color1: [0.08, 0.10, 0.30],
    color2: [0.10, 0.58, 0.40],
    color3: [0.28, 0.38, 0.86],
    color4: [0.62, 0.22, 0.80],
    color5: [0.20, 0.80, 0.65],
  },
  ember: {
    color1: [0.25, 0.06, 0.04],
    color2: [0.95, 0.55, 0.10],
    color3: [0.88, 0.18, 0.08],
    color4: [1.00, 0.76, 0.18],
    color5: [0.95, 0.35, 0.05],
  },
  moss: {
    color1: [0.82, 0.88, 0.70],
    color2: [0.32, 0.62, 0.26],
    color3: [0.16, 0.45, 0.30],
    color4: [0.58, 0.80, 0.45],
    color5: [0.45, 0.72, 0.35],
  },
  lavender: {
    color1: [0.92, 0.86, 0.98],
    color2: [0.65, 0.45, 0.82],
    color3: [0.45, 0.30, 0.72],
    color4: [0.82, 0.60, 0.95],
    color5: [0.72, 0.48, 0.90],
  },
  twilight: {
    color1: [0.16, 0.10, 0.35],
    color2: [0.50, 0.16, 0.46],
    color3: [0.86, 0.35, 0.40],
    color4: [0.95, 0.60, 0.26],
    color5: [0.75, 0.25, 0.42],
  },
  arctic: {
    color1: [0.86, 0.92, 1.00],
    color2: [0.45, 0.70, 0.92],
    color3: [0.26, 0.50, 0.82],
    color4: [0.65, 0.85, 0.92],
    color5: [0.40, 0.78, 0.95],
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

export default function FramerWaveGradient({
  colors = THEMES.sunset,
  speed = 1,
  className,
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const colorsRef = useRef(colors)
  const speedRef = useRef(speed)
  const [isSupported, setIsSupported] = useState(true)
  const [isReady, setIsReady] = useState(false)
  colorsRef.current = colors
  speedRef.current = speed

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
    for (const name of ["u_time", "u_viewport", "u_color1", "u_color2", "u_color3", "u_color4", "u_color5"]) {
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

    let phase = 0
    let lastTime = performance.now()
    let frameId

    const render = () => {
      const now = performance.now()
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now
      phase += dt * speedRef.current * 1.8

      const { width, height } = sizeRef
      if (width > 0 && height > 0) {
        gl.viewport(0, 0, width, height)
        gl.clear(gl.COLOR_BUFFER_BIT)

        const c = colorsRef.current
        gl.uniform1f(uniforms.u_time, phase)
        gl.uniform2fv(uniforms.u_viewport, [width, height])
        gl.uniform3fv(uniforms.u_color1, c.color1)
        gl.uniform3fv(uniforms.u_color2, c.color2)
        gl.uniform3fv(uniforms.u_color3, c.color3)
        gl.uniform3fv(uniforms.u_color4, c.color4)
        gl.uniform3fv(uniforms.u_color5, c.color5)

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
