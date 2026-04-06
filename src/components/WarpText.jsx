import { cn } from "@/lib/utils"
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext"
import { useEffect, useRef, useState } from "react"

// Ported from p5.js sketch2850448
// Noise-warped text rendered via WebGL2 — text is measured and line-broken by
// @chenglou/pretext (zero-reflow canvas.measureText), rasterised to a texture,
// then a fragment shader displaces UVs with 3D Perlin noise.
// Pointer interaction amplifies the warp near the cursor for a fluid feel.

const VERT = `#version 300 es
const vec4 pos[6] = vec4[](
  vec4(-1,-1,0,1), vec4(3,-1,0,1), vec4(-1,3,0,1),
  vec4(-1,-1,0,1), vec4(3,-1,0,1), vec4(-1,3,0,1)
);
out vec2 v_uv;
void main() {
  gl_Position = pos[gl_VertexID];
  v_uv = pos[gl_VertexID].xy * 0.5 + 0.5;
  v_uv.y = 1.0 - v_uv.y;
}`

const FRAG = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_text;
uniform vec3 u_bgColor;
uniform float u_textAspect;
uniform float u_warpIntensity;
uniform float u_noiseScale;
uniform float u_warpSpeed;
uniform vec2 u_mouse;
uniform float u_interactive;

// ---- 3D Perlin noise (Ashima Arts / Stefan Gustavson) ----
vec4 permute(vec4 x) { return mod((x * 34.0 + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec3 P) {
  vec3 Pi0 = floor(P); vec3 Pi1 = Pi0 + 1.0;
  Pi0 = mod(Pi0, 289.0); Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); vec3 Pf1 = Pf0 - 1.0;
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = vec4(Pi0.z); vec4 iz1 = vec4(Pi1.z);
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0); vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 / 7.0; vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0; vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x); vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z); vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x); vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z); vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000,Pf0); float n100 = dot(g100,vec3(Pf1.x,Pf0.yz));
  float n010 = dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z)); float n110 = dot(g110,vec3(Pf1.xy,Pf0.z));
  float n001 = dot(g001,vec3(Pf0.xy,Pf1.z)); float n101 = dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));
  float n011 = dot(g011,vec3(Pf0.x,Pf1.yz)); float n111 = dot(g111,Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
  vec2 n_yz = mix(n_z.xy,n_z.zw,fade_xyz.y);
  return 2.2 * mix(n_yz.x,n_yz.y,fade_xyz.x);
}

void main() {
  float screenAspect = u_resolution.x / u_resolution.y;

  // World-space position (aspect-corrected) — noise is sampled here so the
  // warp pattern stays stable regardless of text position.
  vec2 world = vec2(v_uv.x * screenAspect, v_uv.y);

  // Map screen UV -> text-texture UV, centred and correctly proportioned.
  vec2 tuv = v_uv;
  tuv.x = (v_uv.x - 0.5) * screenAspect / u_textAspect + 0.5;

  // Noise-based displacement
  float t = u_time * u_warpSpeed;
  float dx = cnoise(vec3(world * u_noiseScale, t));
  float dy = cnoise(vec3(world * u_noiseScale + vec2(31.7, 47.3), t + 100.0));

  // Interactive: amplify warp near the pointer (up to 5x at cursor centre)
  vec2 mouseWorld = vec2(u_mouse.x * screenAspect, u_mouse.y);
  float mouseDist = length(world - mouseWorld);
  float mouseGain = 1.0 + u_interactive * smoothstep(0.6, 0.0, mouseDist) * 4.0;

  tuv += vec2(dx, dy) * u_warpIntensity * mouseGain;

  // Sample text texture (CLAMP_TO_EDGE + transparent padding handles OOB)
  vec4 tex = texture(u_text, tuv);

  // Blend: background colour underneath, text (with stroke) on top
  vec3 color = mix(u_bgColor, tex.rgb, tex.a);
  fragColor = vec4(color, 1.0);
}`

function hexToRgb01(hex) {
  const n = parseInt(hex.replace("#", ""), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255)
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

function createTextTexture(gl, text, fillColor, strokeColor, fontSize) {
  const font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`

  // Use pretext for proper multiline text measurement & line breaking —
  // zero DOM reflow, pure canvas.measureText under the hood.
  const prepared = prepareWithSegments(text, font)
  const lineHeight = fontSize * 1.25
  const maxTextWidth = fontSize * 14
  const { lines } = layoutWithLines(prepared, maxTextWidth, lineHeight)

  // Find widest line to size the texture
  let maxLineWidth = 0
  for (const line of lines) {
    if (line.width > maxLineWidth) maxLineWidth = line.width
  }

  const textBlockHeight = lines.length * lineHeight

  // Generous padding so warp displacement doesn't clip
  const padX = fontSize * 0.8
  const padY = fontSize * 0.8
  const w = Math.ceil(maxLineWidth + padX * 2)
  const h = Math.ceil(textBlockHeight + padY * 2)

  const offscreen = document.createElement("canvas")
  offscreen.width = w
  offscreen.height = h
  const ctx = offscreen.getContext("2d")

  ctx.clearRect(0, 0, w, h)
  ctx.font = font
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  const cx = w / 2

  for (let i = 0; i < lines.length; i++) {
    const y = padY + i * lineHeight + lineHeight / 2

    if (strokeColor) {
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = fontSize * 0.035
      ctx.lineJoin = "round"
      ctx.strokeText(lines[i].text, cx, y)
    }

    ctx.fillStyle = fillColor
    ctx.fillText(lines[i].text, cx, y)
  }

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offscreen)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

  return { texture, aspect: w / h }
}

export default function WarpText({
  text = "p5*js",
  background = "#F52CA6",
  color = "#ffffff",
  strokeColor = "rgba(0,0,0,0.6)",
  warpIntensity = 0.06,
  warpSpeed = 0.4,
  noiseScale = 3.0,
  fontSize = 220,
  interactive = true,
  className,
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -10, y: -10 })
  const propsRef = useRef({ background, warpIntensity, warpSpeed, noiseScale, interactive })
  const [isSupported, setIsSupported] = useState(true)

  propsRef.current = { background, warpIntensity, warpSpeed, noiseScale, interactive }

  const handlePointerMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    }
  }

  const handlePointerLeave = () => {
    mouseRef.current = { x: -10, y: -10 }
  }

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true })
    if (!gl) { setIsSupported(false); return }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG)
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
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    const u = {}
    for (const name of [
      "u_resolution", "u_time", "u_text", "u_bgColor",
      "u_textAspect", "u_warpIntensity", "u_noiseScale", "u_warpSpeed",
      "u_mouse", "u_interactive",
    ]) {
      u[name] = gl.getUniformLocation(program, name)
    }

    const { texture, aspect: textAspect } = createTextTexture(
      gl, text, color, strokeColor, fontSize,
    )

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

    let animPhase = 0
    let lastTime = performance.now()
    let frameId

    const render = () => {
      const now = performance.now()
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now
      animPhase += dt

      const { width, height } = sizeRef
      if (width > 0 && height > 0) {
        gl.viewport(0, 0, width, height)
        gl.clear(gl.COLOR_BUFFER_BIT)

        const P = propsRef.current
        const bg = hexToRgb01(P.background)

        gl.uniform2fv(u.u_resolution, [width, height])
        gl.uniform1f(u.u_time, animPhase)
        gl.uniform3fv(u.u_bgColor, bg)
        gl.uniform1f(u.u_textAspect, textAspect)
        gl.uniform1f(u.u_warpIntensity, P.warpIntensity)
        gl.uniform1f(u.u_noiseScale, P.noiseScale)
        gl.uniform1f(u.u_warpSpeed, P.warpSpeed)
        gl.uniform2fv(u.u_mouse, [mouseRef.current.x, mouseRef.current.y])
        gl.uniform1f(u.u_interactive, P.interactive ? 1.0 : 0.0)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.uniform1i(u.u_text, 0)

        gl.drawArrays(gl.TRIANGLES, 0, 6)
      }

      frameId = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      gl.deleteTexture(texture)
      gl.deleteVertexArray(vao)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [text, color, strokeColor, fontSize])

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {isSupported ? (
        <canvas ref={canvasRef} className="absolute inset-0" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
          WebGL2 not supported in this browser.
        </div>
      )}
    </div>
  )
}
