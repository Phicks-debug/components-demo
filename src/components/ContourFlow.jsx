import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

// Ported from SamuelYAN's p5.js sketch (sketch2729838)
// Animated contour lines using domain-warped fbm noise rendered via WebGL2

const VERTEX_SHADER = `#version 300 es
const vec4 pos[6] = vec4[](
  vec4(-1,-1,0,1), vec4(3,-1,0,1), vec4(-1,3,0,1),
  vec4(-1,-1,0,1), vec4(3,-1,0,1), vec4(-1,3,0,1)
);
void main() { gl_Position = pos[gl_VertexID]; }`

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_noiseSpeed;
uniform float u_grainSpeed;
uniform float u_thickness;
uniform float u_frequency;
uniform float u_pulseSpeed;
uniform vec3 u_colorBg;
uniform vec3 u_colorLine;
uniform vec3 u_colorAccent;
uniform sampler2D u_texture;
uniform float u_useTexture;

out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.25;
  for (int i = 0; i < 2; i++) {
    value += amplitude * noise(p);
    p *= 1.25;
    amplitude *= 0.125;
  }
  return value;
}

float contourLines(float v, float frequency, float line_thickness) {
  float lines = abs(fract(v * frequency) - 0.299);
  return smoothstep(0.5 - line_thickness, 0.499 + line_thickness, lines);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 nuv = uv * -4.0 - 10.0;
  nuv.x *= u_resolution.x / u_resolution.y;

  float t = u_time * u_noiseSpeed;
  float tg = u_time * u_grainSpeed;

  vec2 warp1 = vec2(
    noise(nuv * 1.0 + vec2(t * 1.3, t * 0.2)),
    noise(nuv * 120.0 + vec2(-tg * 0.4, tg * 0.2))
  );
  vec2 uv2 = nuv + (warp1 - 0.25) * 0.6;

  vec2 warp2 = vec2(
    noise(uv2 * 1.0 + vec2(-t * 0.6, t * 0.4)),
    noise(uv2 * 190.0 + vec2(tg * 2.5, tg * 0.3))
  );
  vec2 uvFinal = uv2 + (warp2 - 1.5) / 0.995;

  vec2 flow = uvFinal + vec2(u_time * 0.26, u_time * 0.1);
  float n = fbm(flow);

  float n1 = fbm(flow + vec2(0.001, 0.0));
  float n2 = fbm(flow + vec2(0.0, 0.001));
  float grad = length(vec2(n1 - n, n2 - n));
  float edge = smoothstep(0.02, 0.2, grad);

  float frequency = sin(u_time * 0.1 * u_pulseSpeed) * 5.0 + u_frequency;
  float lines = contourLines(n, frequency, u_thickness);

  // background: theme color or image texture
  vec3 bgColor = u_colorBg;
  if (u_useTexture > 0.5) {
    vec2 texUv = uv;
    texUv.y = 1.0 - texUv.y;
    bgColor = texture(u_texture, texUv).rgb;
  }

  // lines=0 on contour, 1 off contour
  vec3 color = mix(u_colorLine, bgColor, lines);
  color = mix(color, u_colorAccent, edge * 0.5);

  fragColor = vec4(color, 1.0);
}`

export const THEMES = {
  mono: { bg: [1, 1, 1], line: [0.08, 0.08, 0.08], accent: [0.45, 0.45, 0.45] },
  ink: { bg: [0.03, 0.03, 0.06], line: [0.92, 0.9, 0.85], accent: [0.5, 0.48, 0.42] },
  ocean: { bg: [0.01, 0.06, 0.14], line: [0.35, 0.75, 0.95], accent: [0.12, 0.35, 0.55] },
  ember: { bg: [0.1, 0.03, 0.01], line: [1.0, 0.55, 0.2], accent: [0.7, 0.2, 0.05] },
  forest: { bg: [0.02, 0.08, 0.04], line: [0.35, 0.82, 0.45], accent: [0.15, 0.45, 0.22] },
  lavender: { bg: [0.06, 0.03, 0.12], line: [0.72, 0.55, 1.0], accent: [0.42, 0.22, 0.65] },
  gold: { bg: [0.08, 0.06, 0.01], line: [1.0, 0.85, 0.35], accent: [0.7, 0.55, 0.1] },
  rose: { bg: [0.12, 0.03, 0.06], line: [1.0, 0.5, 0.65], accent: [0.7, 0.22, 0.35] },
  arctic: { bg: [0.92, 0.95, 0.98], line: [0.22, 0.48, 0.68], accent: [0.5, 0.72, 0.88] },
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

export default function ContourFlow({
  speed = 1,
  noiseSpeed = 1,
  grainSpeed = 1,
  pulseSpeed = 1,
  thickness = 0.125,
  frequency = 10,
  colors = THEMES.mono,
  imageSrc,
  className,
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const speedRef = useRef(speed)
  const noiseSpeedRef = useRef(noiseSpeed)
  const grainSpeedRef = useRef(grainSpeed)
  const pulseSpeedRef = useRef(pulseSpeed)
  const thicknessRef = useRef(thickness)
  const frequencyRef = useRef(frequency)
  const colorsRef = useRef(colors)
  const glRef = useRef(null)
  const textureRef = useRef(null)
  const useTextureRef = useRef(false)
  const [isSupported, setIsSupported] = useState(true)

  speedRef.current = speed
  noiseSpeedRef.current = noiseSpeed
  grainSpeedRef.current = grainSpeed
  pulseSpeedRef.current = pulseSpeed
  thicknessRef.current = thickness
  frequencyRef.current = frequency
  colorsRef.current = colors

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true })
    if (!gl) { setIsSupported(false); return }
    glRef.current = gl

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

    const u = {}
    for (const name of [
      "u_resolution", "u_time", "u_noiseSpeed", "u_grainSpeed", "u_pulseSpeed", "u_thickness", "u_frequency",
      "u_colorBg", "u_colorLine", "u_colorAccent", "u_texture", "u_useTexture",
    ]) {
      u[name] = gl.getUniformLocation(program, name)
    }

    // create placeholder texture
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    textureRef.current = texture

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
      animPhase += dt * speedRef.current

      const { width, height } = sizeRef
      if (width > 0 && height > 0) {
        gl.viewport(0, 0, width, height)

        const c = colorsRef.current
        gl.uniform2fv(u.u_resolution, [width, height])
        gl.uniform1f(u.u_time, animPhase)
        gl.uniform1f(u.u_noiseSpeed, noiseSpeedRef.current)
        gl.uniform1f(u.u_grainSpeed, grainSpeedRef.current)
        gl.uniform1f(u.u_pulseSpeed, pulseSpeedRef.current)
        gl.uniform1f(u.u_thickness, thicknessRef.current)
        gl.uniform1f(u.u_frequency, frequencyRef.current)
        gl.uniform3fv(u.u_colorBg, c.bg)
        gl.uniform3fv(u.u_colorLine, c.line)
        gl.uniform3fv(u.u_colorAccent, c.accent)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, textureRef.current)
        gl.uniform1i(u.u_texture, 0)
        gl.uniform1f(u.u_useTexture, useTextureRef.current ? 1.0 : 0.0)

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
      glRef.current = null
      textureRef.current = null
    }
  }, [])

  // load image texture when imageSrc changes
  useEffect(() => {
    const gl = glRef.current
    const texture = textureRef.current
    if (!gl || !texture) return

    if (!imageSrc) {
      useTextureRef.current = false
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      if (!glRef.current) return
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      useTextureRef.current = true
    }
    img.onerror = () => { useTextureRef.current = false }
    img.src = imageSrc

    return () => { useTextureRef.current = false }
  }, [imageSrc])

  return (
    <div ref={containerRef} className={cn("relative h-full w-full", className)}>
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
