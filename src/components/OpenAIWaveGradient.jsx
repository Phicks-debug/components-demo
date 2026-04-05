import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

// Uses the exact same shader as beeblast-website NoiseShader.tsx
// The getOrb() function computes the wave gradient; main() outputs color only (no SDF clipping)

const VERTEX_SHADER = `#version 300 es
out vec4 out_position;
out vec2 out_uv;

const vec4 blitFullscreenTrianglePositions[6] = vec4[](
    vec4(-1.0, -1.0, 0.0, 1.0),
    vec4(3.0, -1.0, 0.0, 1.0),
    vec4(-1.0, 3.0, 0.0, 1.0),
    vec4(-1.0, -1.0, 0.0, 1.0),
    vec4(3.0, -1.0, 0.0, 1.0),
    vec4(-1.0, 3.0, 0.0, 1.0)
);

void main() {
    out_position = blitFullscreenTrianglePositions[gl_VertexID];
    out_uv = out_position.xy * 0.5 + 0.5;
    out_uv.y = 1.0 - out_uv.y;
    gl_Position = out_position;
}`

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

#define E (2.71828182846)
#define pi (3.14159265358979323844)
#define NUM_OCTAVES (4)

in vec2 out_uv;
out vec4 fragColor;

uniform float u_time;
uniform float u_stateTime;
uniform vec2 u_viewport;

uniform sampler2D uTextureNoise;
uniform vec3 u_bloopColorMain;
uniform vec3 u_bloopColorLow;
uniform vec3 u_bloopColorMid;
uniform vec3 u_bloopColorHigh;

struct ColoredSDF {
    float distance;
    vec4 color;
};

struct SDFArgs {
    vec2 st;
    float duration;
    float time;
};

float scaled(float edge0, float edge1, float x) { return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0); }
float fixedSpring(float t, float d) {
    float s = mix(1.0 - exp(-E * 2.0 * t) * cos((1.0 - d) * 115.0 * t), 1.0, clamp(t, 0.0, 1.0));
    return s * (1.0 - t) + t;
}

vec3 blendLinearBurn_13_5(vec3 base, vec3 blend, float opacity) {
    return (max(base + blend - vec3(1.0), vec3(0.0))) * opacity + base * (1.0 - opacity);
}

vec4 permute(vec4 x) { return mod((x * 34.0 + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
float rand(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }

float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u * u * (3.0 - 2.0 * u);
    float res = mix(
        mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
        mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
        u.y
    );
    return res * res;
}

float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(x);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

float cnoise(vec3 P) {
    vec3 Pi0 = floor(P); vec3 Pi1 = Pi0 + vec3(1.0);
    Pi0 = mod(Pi0, 289.0); Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P); vec3 Pf1 = Pf0 - vec3(1.0);
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = vec4(Pi0.z); vec4 iz1 = vec4(Pi1.z);
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0); vec4 ixy1 = permute(ixy + iz1);
    vec4 gx0 = ixy0 / 7.0; vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(vec4(0.0), gx0) - 0.5);
    gy0 -= sz0 * (step(vec4(0.0), gy0) - 0.5);
    vec4 gx1 = ixy1 / 7.0; vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(vec4(0.0), gx1) - 0.5);
    gy1 -= sz1 * (step(vec4(0.0), gy1) - 0.5);
    vec3 g000 = vec3(gx0.x, gy0.x, gz0.x); vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
    vec3 g010 = vec3(gx0.z, gy0.z, gz0.z); vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
    vec3 g001 = vec3(gx1.x, gy1.x, gz1.x); vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
    vec3 g011 = vec3(gx1.z, gy1.z, gz1.z); vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);
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
    float n_xyz = mix(n_yz.x,n_yz.y,fade_xyz.x);
    return 2.2 * n_xyz;
}

ColoredSDF getOrb(SDFArgs args) {
    ColoredSDF sdf;
    float entryAnimation = fixedSpring(scaled(0.0, 2.0, args.duration), 0.92);
    float baseRadius = 0.37;
    float entryScale = mix(0.9, 1.0, entryAnimation);
    float radius = baseRadius * entryScale;
    vec2 adjusted_st = args.st;
    float scaleFactor = 1.0 / (2.0 * radius);
    vec2 uv = adjusted_st * scaleFactor + 0.5;
    uv.y = 1.0 - uv.y;
    float noiseScale = 1.25;
    float windSpeed = 0.12;
    float warpPower = 0.35;
    float waterColorNoiseScale = 18.0;
    float waterColorNoiseStrength = 0.02;
    float textureNoiseScale = 1.0;
    float textureNoiseStrength = 0.15;
    float verticalOffset = 0.09;
    float waveSpread = 1.0;
    float layer1Amplitude = 1.5;
    float layer1Frequency = 1.0;
    float layer2Amplitude = 1.4;
    float layer2Frequency = 1.0;
    float layer3Amplitude = 1.3;
    float layer3Frequency = 1.0;
    float fbmStrength = 1.2;
    float fbmPowerDamping = 0.55;
    float blurRadius = 1.0;
    float timescale = 1.0;
    float time = args.time * timescale * 0.85;
    verticalOffset += 1.0 - waveSpread;
    float noiseX = cnoise(vec3(uv * 1.0 + vec2(0.0, 74.8572), time * 0.3));
    float noiseY = cnoise(vec3(uv * 1.0 + vec2(203.91282, 10.0), time * 0.3));
    uv += vec2(noiseX * 2.0, noiseY) * warpPower;
    float noiseA = cnoise(vec3(uv * waterColorNoiseScale + vec2(344.91282, 0.0), time * 0.3)) +
                   cnoise(vec3(uv * waterColorNoiseScale * 2.2 + vec2(723.937, 0.0), time * 0.4)) * 0.5;
    uv += noiseA * waterColorNoiseStrength;
    uv.y -= verticalOffset;
    vec2 textureUv = uv * textureNoiseScale;
    float textureSampleR0 = texture(uTextureNoise, textureUv).r;
    float textureSampleG0 = texture(uTextureNoise, vec2(textureUv.x, 1.0 - textureUv.y)).g;
    float textureNoiseDisp0 = mix(textureSampleR0 - 0.5, textureSampleG0 - 0.5, (sin(time) + 1.0) * 0.5) * textureNoiseStrength;
    textureUv += vec2(63.861, 368.937);
    float textureSampleR1 = texture(uTextureNoise, textureUv).r;
    float textureSampleG1 = texture(uTextureNoise, vec2(textureUv.x, 1.0 - textureUv.y)).g;
    float textureNoiseDisp1 = mix(textureSampleR1 - 0.5, textureSampleG1 - 0.5, (sin(time) + 1.0) * 0.5) * textureNoiseStrength;
    textureUv += vec2(272.861, 829.937);
    textureUv += vec2(180.302, 819.871);
    float textureSampleR3 = texture(uTextureNoise, textureUv).r;
    float textureSampleG3 = texture(uTextureNoise, vec2(textureUv.x, 1.0 - textureUv.y)).g;
    float textureNoiseDisp3 = mix(textureSampleR3 - 0.5, textureSampleG3 - 0.5, (sin(time) + 1.0) * 0.5) * textureNoiseStrength;
    uv += textureNoiseDisp0;
    vec2 st_fbm = uv * noiseScale;
    vec2 q = vec2(0.0);
    q.x = fbm(st_fbm * 0.5 + windSpeed * time);
    q.y = fbm(st_fbm * 0.5 + windSpeed * time);
    vec2 r = vec2(0.0);
    r.x = fbm(st_fbm + 1.0 * q + vec2(0.3, 9.2) + 0.15 * time);
    r.y = fbm(st_fbm + 1.0 * q + vec2(8.3, 0.8) + 0.126 * time);
    float f = fbm(st_fbm + r - q);
    float fullFbm = (f + 0.6 * f * f + 0.7 * f + 0.5) * 0.5;
    fullFbm = pow(fullFbm, fbmPowerDamping);
    fullFbm *= fbmStrength;
    blurRadius = blurRadius * 1.5;
    vec2 snUv = (uv + vec2((fullFbm - 0.5) * 1.2) + vec2(0.0, 0.025) + textureNoiseDisp0) * vec2(layer1Frequency, 1.0);
    float sn = noise(snUv * 2.0 + vec2(0.0, time * 0.5)) * 2.0 * layer1Amplitude;
    float sn2 = smoothstep(sn - 1.2 * blurRadius, sn + 1.2 * blurRadius, (snUv.y - 0.5 * waveSpread) * 5.0 + 0.5);
    vec2 snUvBis = (uv + vec2((fullFbm - 0.5) * 0.85) + vec2(0.0, 0.025) + textureNoiseDisp1) * vec2(layer2Frequency, 1.0);
    float snBis = noise(snUvBis * 4.0 + vec2(293.0, time * 1.0)) * 2.0 * layer2Amplitude;
    float sn2Bis = smoothstep(snBis - 0.9 * blurRadius, snBis + 0.9 * blurRadius, (snUvBis.y - 0.6 * waveSpread) * 5.0 + 0.5);
    vec2 snUvThird = (uv + vec2((fullFbm - 0.5) * 1.1) + textureNoiseDisp3) * vec2(layer3Frequency, 1.0);
    float snThird = noise(snUvThird * 6.0 + vec2(153.0, time * 1.2)) * 2.0 * layer3Amplitude;
    float sn2Third = smoothstep(snThird - 0.7 * blurRadius, snThird + 0.7 * blurRadius, (snUvThird.y - 0.9 * waveSpread) * 6.0 + 0.5);
    sn2 = pow(sn2, 0.8);
    sn2Bis = pow(sn2Bis, 0.9);
    vec3 sinColor;
    sinColor = blendLinearBurn_13_5(u_bloopColorMain, u_bloopColorLow, 1.0 - sn2);
    sinColor = blendLinearBurn_13_5(sinColor, mix(u_bloopColorMain, u_bloopColorMid, 1.0 - sn2Bis), sn2);
    sinColor = mix(sinColor, mix(u_bloopColorMain, u_bloopColorHigh, 1.0 - sn2Third), sn2 * sn2Bis);
    sdf.color = vec4(sinColor, 1.0);
    sdf.distance = length(adjusted_st) - radius;
    return sdf;
}

void main() {
    vec2 st = out_uv - 0.5;
    st.y *= u_viewport.y / u_viewport.x;
    SDFArgs args;
    args.st = st;
    args.time = u_time;
    args.duration = u_stateTime;
    ColoredSDF res = getOrb(args);
    fragColor = vec4(res.color.rgb, 1.0);
}`

export const THEMES = {
  amber: {
    main: [0.98, 0.83, 0.32],
    low: [0.85, 0.58, 0.08],
    mid: [0.95, 0.72, 0.18],
    high: [1.0, 0.97, 0.78],
  },
  gold: {
    main: [1.0, 0.88, 0.4],
    low: [0.88, 0.65, 0.12],
    mid: [0.96, 0.78, 0.26],
    high: [1.0, 0.98, 0.82],
  },
  honey: {
    main: [1.0, 0.86, 0.52],
    low: [0.9, 0.66, 0.24],
    mid: [0.97, 0.78, 0.38],
    high: [1.0, 0.97, 0.84],
  },
  ember: {
    main: [1.0, 0.65, 0.18],
    low: [0.8, 0.35, 0.05],
    mid: [0.92, 0.52, 0.12],
    high: [1.0, 0.88, 0.6],
  },
  copper: {
    main: [0.92, 0.58, 0.28],
    low: [0.7, 0.35, 0.1],
    mid: [0.84, 0.48, 0.18],
    high: [1.0, 0.85, 0.65],
  },
  cobalt: {
    main: [0.3, 0.56, 1.0],
    low: [0.08, 0.22, 0.62],
    mid: [0.18, 0.4, 0.88],
    high: [0.82, 0.92, 1.0],
  },
  violet: {
    main: [0.62, 0.4, 1.0],
    low: [0.26, 0.1, 0.55],
    mid: [0.46, 0.24, 0.82],
    high: [0.9, 0.86, 1.0],
  },
  jade: {
    main: [0.22, 0.82, 0.58],
    low: [0.04, 0.38, 0.24],
    mid: [0.12, 0.62, 0.42],
    high: [0.84, 1.0, 0.94],
  },
  rose: {
    main: [1.0, 0.46, 0.64],
    low: [0.58, 0.14, 0.28],
    mid: [0.86, 0.28, 0.46],
    high: [1.0, 0.88, 0.92],
  },
  fuchsia: {
    main: [0.92, 0.28, 0.84],
    low: [0.46, 0.06, 0.42],
    mid: [0.7, 0.16, 0.64],
    high: [1.0, 0.86, 0.98],
  },
  moss: {
    main: [0.58, 0.76, 0.2],
    low: [0.26, 0.36, 0.06],
    mid: [0.42, 0.56, 0.12],
    high: [0.92, 0.98, 0.74],
  },
  mocha: {
    main: [0.74, 0.56, 0.4],
    low: [0.34, 0.22, 0.12],
    mid: [0.54, 0.38, 0.24],
    high: [0.92, 0.84, 0.74],
  },
}

function createNoiseTexture(gl, seed = 0) {
  const size = 256
  const data = new Uint8Array(size * size * 4)
  const so = seed * 137.508

  const hash = (x, y) => {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
    return n - Math.floor(n)
  }
  const valueNoise = (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y)
    const fx = x - ix, fy = y - iy
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy)
    const a = hash(ix, iy), b = hash(ix + 1, iy)
    const c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1)
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
  }
  const fbm = (x, y) => {
    let v = 0, a = 0.5, px = x, py = y
    for (let i = 0; i < 6; i++) {
      v += a * valueNoise(px + i * 100, py + i * 100)
      px *= 2; py *= 2; a *= 0.5
    }
    return v
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4
      const nx = (x / size) * 4 + so, ny = (y / size) * 4 + so
      data[idx] = Math.floor(fbm(nx, ny) * 255)
      data[idx + 1] = Math.floor(fbm(nx + 200, ny + 300) * 255)
      data[idx + 2] = Math.floor(fbm(nx + 500, ny + 700) * 255)
      data[idx + 3] = 255
    }
  }

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  return texture
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

export default function OpenAIWaveGradient({
  colors = THEMES.amber,
  speed = 1,
  seed = 0,
  phaseOffset = 0,
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
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0, 0, 0, 0)

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    const uniformNames = [
      "u_time", "u_stateTime", "u_viewport", "uTextureNoise",
      "u_bloopColorMain", "u_bloopColorLow", "u_bloopColorMid", "u_bloopColorHigh",
    ]
    const uniforms = {}
    for (const name of uniformNames) {
      uniforms[name] = gl.getUniformLocation(program, name)
    }

    const noiseTexture = createNoiseTexture(gl, seed)

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

    const stateStart = performance.now()
    const noiseReadyTime = performance.now()
    setIsReady(true)

    let animPhase = phaseOffset
    let lastTime = performance.now()
    let frameId

    const render = () => {
      const now = performance.now()
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now
      animPhase += dt * speedRef.current * 0.95

      const stateTime = Math.max(0, (now - Math.max(stateStart, noiseReadyTime)) / 1000)

      const { width, height } = sizeRef
      if (width > 0 && height > 0) {
        gl.viewport(0, 0, width, height)
        gl.clear(gl.COLOR_BUFFER_BIT)

        const c = colorsRef.current
        gl.uniform1f(uniforms.u_time, animPhase)
        gl.uniform1f(uniforms.u_stateTime, stateTime)
        gl.uniform2fv(uniforms.u_viewport, [width, height])
        gl.uniform3fv(uniforms.u_bloopColorMain, c.main)
        gl.uniform3fv(uniforms.u_bloopColorLow, c.low)
        gl.uniform3fv(uniforms.u_bloopColorMid, c.mid)
        gl.uniform3fv(uniforms.u_bloopColorHigh, c.high)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, noiseTexture)
        gl.uniform1i(uniforms.uTextureNoise, 0)

        gl.drawArrays(gl.TRIANGLES, 0, 6)
      }

      frameId = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      gl.deleteTexture(noiseTexture)
      gl.deleteVertexArray(vao)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [seed, phaseOffset])

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
