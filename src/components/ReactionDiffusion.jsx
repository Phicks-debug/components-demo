import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

const RES = 600

const VERT = `#version 300 es
out vec2 vTexCoord;
void main() {
  vec2 p[4] = vec2[](vec2(-1,-1),vec2(1,-1),vec2(-1,1),vec2(1,1));
  vec2 t[4] = vec2[](vec2(0,0),vec2(1,0),vec2(0,1),vec2(1,1));
  vTexCoord = t[gl_VertexID];
  gl_Position = vec4(p[gl_VertexID], 0, 1);
}`

// Shox.blur(3) — 7-tap separable triangular kernel: weights [1,2,3,4,3,2,1]/16
const BLUR_FRAG = `#version 300 es
precision highp float;
uniform sampler2D tex0;
uniform vec2 texelSize;
uniform vec2 direction;
in vec2 vTexCoord;
out vec4 fragColor;
void main() {
  vec2 d = texelSize * direction;
  fragColor = (
    texture(tex0, vTexCoord - 3.0 * d) * 1.0 +
    texture(tex0, vTexCoord - 2.0 * d) * 2.0 +
    texture(tex0, vTexCoord - 1.0 * d) * 3.0 +
    texture(tex0, vTexCoord)             * 4.0 +
    texture(tex0, vTexCoord + 1.0 * d) * 3.0 +
    texture(tex0, vTexCoord + 2.0 * d) * 2.0 +
    texture(tex0, vTexCoord + 3.0 * d) * 1.0
  ) / 16.0;
}`

const UNSHARP_FRAG = `#version 300 es
precision highp float;
uniform sampler2D tex0;
uniform vec2 texelSize;
uniform float u_radius;
uniform float u_amount;
uniform float u_blend;
in vec2 vTexCoord;
out vec4 fragColor;
void main() {
  vec2 ts = texelSize * u_radius;
  vec4 c = texture(tex0, vTexCoord);
  vec4 avg = (
    texture(tex0, vTexCoord + vec2(-ts.x,-ts.y)) +
    texture(tex0, vTexCoord + vec2(0,-ts.y)) +
    texture(tex0, vTexCoord + vec2(ts.x,-ts.y)) +
    texture(tex0, vTexCoord + vec2(-ts.x,0)) +
    texture(tex0, vTexCoord + vec2(ts.x,0)) +
    texture(tex0, vTexCoord + vec2(-ts.x,ts.y)) +
    texture(tex0, vTexCoord + vec2(0,ts.y)) +
    texture(tex0, vTexCoord + vec2(ts.x,ts.y))
  ) / 8.0;
  vec4 sharp = c + (c - avg) * u_amount;
  fragColor = mix(c, sharp, u_blend);
}`

function compileShader(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s))
    gl.deleteShader(s)
    return null
  }
  return s
}

function buildProgram(gl, vsrc, fsrc) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsrc)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsrc)
  if (!vs || !fs) return null
  const prog = gl.createProgram()
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog))
    return null
  }
  return { program: prog, vs, fs }
}

function createFBO(gl, w, h) {
  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  const fbo = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  return { fbo, tex }
}

function toCanvasXY(e, canvas) {
  const rect = canvas.getBoundingClientRect()
  const dw = rect.width, dh = rect.height
  const cw = canvas.width, ch = canvas.height
  const da = dw / dh, ca = cw / ch
  let scale, ox = 0, oy = 0
  if (da > ca) {
    scale = dw / cw
    oy = (dh - ch * scale) / 2
  } else {
    scale = dh / ch
    ox = (dw - cw * scale) / 2
  }
  const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0
  const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0
  return {
    x: (clientX - rect.left - ox) / scale,
    y: (clientY - rect.top - oy) / scale,
  }
}

async function ensureFont() {
  if (document.fonts.check('1px "Source Code Pro"')) return
  try {
    const f = new FontFace(
      "Source Code Pro",
      "url(https://fonts.gstatic.com/s/sourcecodepro/v23/HI_SiYsKILxRpg3hIP6sJ7fM7PqlPevW.woff2)"
    )
    await f.load()
    document.fonts.add(f)
  } catch {}
}

export default function ReactionDiffusion({
  initialText = "",
  interactive = true,
  fontSize = 86,
  radius = 7,
  sharpness = 64,
  blend = 0.5,
  darkMode = true,
  clearTrigger = 0,
  className,
}) {
  const canvasRef = useRef(null)
  const [isSupported, setIsSupported] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const clearFnRef = useRef(null)

  const radiusRef = useRef(radius)
  const sharpnessRef = useRef(sharpness)
  const blendRef = useRef(blend)
  const fontSizeRef = useRef(fontSize)
  radiusRef.current = radius
  sharpnessRef.current = sharpness
  blendRef.current = blend
  fontSizeRef.current = fontSize

  useEffect(() => {
    if (clearTrigger > 0 && clearFnRef.current) clearFnRef.current()
  }, [clearTrigger])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const glCanvas = document.createElement("canvas")
    glCanvas.width = RES
    glCanvas.height = RES
    const gl = glCanvas.getContext("webgl2", { preserveDrawingBuffer: true, premultipliedAlpha: false })
    if (!gl) { setIsSupported(false); return }

    const blurProg = buildProgram(gl, VERT, BLUR_FRAG)
    const unsharpProg = buildProgram(gl, VERT, UNSHARP_FRAG)
    if (!blurProg || !unsharpProg) return

    const bU = {
      tex0: gl.getUniformLocation(blurProg.program, "tex0"),
      texelSize: gl.getUniformLocation(blurProg.program, "texelSize"),
      direction: gl.getUniformLocation(blurProg.program, "direction"),
    }
    const uU = {
      tex0: gl.getUniformLocation(unsharpProg.program, "tex0"),
      texelSize: gl.getUniformLocation(unsharpProg.program, "texelSize"),
      u_radius: gl.getUniformLocation(unsharpProg.program, "u_radius"),
      u_amount: gl.getUniformLocation(unsharpProg.program, "u_amount"),
      u_blend: gl.getUniformLocation(unsharpProg.program, "u_blend"),
    }

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    const fboA = createFBO(gl, RES, RES)
    const fboB = createFBO(gl, RES, RES)

    const inputTex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, inputTex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    const texelSize = [1 / RES, 1 / RES]
    const MARGIN = 50
    let cursorColor = darkMode ? 255 : 0
    let cursorX = MARGIN
    let cursorY = RES / 2
    let lastTypeTime = 0
    let fontReady = false

    ctx.fillStyle = darkMode ? "#000" : "#fff"
    ctx.fillRect(0, 0, RES, RES)

    function drawChar(char) {
      const size = fontSizeRef.current
      ctx.font = `${size}px "Source Code Pro", monospace`
      const cw = ctx.measureText(char).width
      const padY = Math.round(size * 0.42)
      const padC = Math.round(size * 0.058)

      if (Date.now() - lastTypeTime > 1500 && lastTypeTime > 0) {
        cursorX = MARGIN
        cursorY = RES / 2
      }

      ctx.fillStyle = cursorColor === 255 ? "#000" : "#fff"
      ctx.fillRect(
        cursorX - cw / 2 + padC,
        cursorY - size / 2 - padY / 2,
        cw - padC,
        size * 1.5 + padY,
      )

      ctx.fillStyle = cursorColor === 255 ? "#fff" : "#000"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(char, cursorX, cursorY)

      cursorX += cw + padC
      if (cursorX > RES - MARGIN) {
        cursorX = MARGIN
        cursorY += size + padY
      }
      if (cursorY > RES - size) {
        cursorX = MARGIN
        cursorY = RES / 2
      }
      lastTypeTime = Date.now()
    }

    function clearScreen() {
      ctx.fillStyle = cursorColor === 255 ? "#000" : "#fff"
      ctx.fillRect(0, 0, RES, RES)
      cursorX = MARGIN
      cursorY = RES / 2
    }
    clearFnRef.current = clearScreen

    function processFrame() {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, inputTex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)

      gl.bindFramebuffer(gl.FRAMEBUFFER, fboA.fbo)
      gl.viewport(0, 0, RES, RES)
      gl.useProgram(blurProg.program)
      gl.bindTexture(gl.TEXTURE_2D, inputTex)
      gl.uniform1i(bU.tex0, 0)
      gl.uniform2fv(bU.texelSize, texelSize)
      gl.uniform2fv(bU.direction, [1, 0])
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      gl.bindFramebuffer(gl.FRAMEBUFFER, fboB.fbo)
      gl.bindTexture(gl.TEXTURE_2D, fboA.tex)
      gl.uniform2fv(bU.direction, [0, 1])
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.useProgram(unsharpProg.program)
      gl.bindTexture(gl.TEXTURE_2D, fboB.tex)
      gl.uniform1i(uU.tex0, 0)
      gl.uniform2fv(uU.texelSize, texelSize)
      gl.uniform1f(uU.u_radius, radiusRef.current)
      gl.uniform1f(uU.u_amount, sharpnessRef.current)
      gl.uniform1f(uU.u_blend, blendRef.current)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      ctx.drawImage(glCanvas, 0, 0)
    }

    let frameId
    let cancelled = false
    const render = () => {
      if (cancelled) return
      processFrame()
      frameId = requestAnimationFrame(render)
    }

    ensureFont().then(() => {
      if (cancelled) return
      fontReady = true
      if (initialText) {
        for (const ch of initialText) drawChar(ch)
        for (let i = 0; i < 60; i++) processFrame()
      }
      setIsReady(true)
      render()
    })

    const handleClick = (e) => {
      if (!interactive) return
      const { x, y } = toCanvasXY(e, canvas)
      cursorX = Math.max(MARGIN, Math.min(RES - MARGIN, x))
      cursorY = Math.max(MARGIN, Math.min(RES - MARGIN, y))
      canvas.focus()
    }
    const handleDblClick = (e) => {
      if (!interactive) return
      e.preventDefault()
      clearScreen()
    }
    const handleKeyDown = (e) => {
      if (!interactive || !fontReady) return
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault()
        clearScreen()
      } else if (e.key === "/") {
        e.preventDefault()
        cursorColor = 255 - cursorColor
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        drawChar(e.key)
      }
    }
    const handleTouch = (e) => {
      if (!interactive) return
      e.preventDefault()
      const { x, y } = toCanvasXY(e, canvas)
      cursorX = Math.max(MARGIN, Math.min(RES - MARGIN, x))
      cursorY = Math.max(MARGIN, Math.min(RES - MARGIN, y))
      canvas.focus()
    }

    canvas.addEventListener("click", handleClick)
    canvas.addEventListener("dblclick", handleDblClick)
    canvas.addEventListener("keydown", handleKeyDown)
    canvas.addEventListener("touchstart", handleTouch, { passive: false })

    return () => {
      cancelled = true
      cancelAnimationFrame(frameId)
      canvas.removeEventListener("click", handleClick)
      canvas.removeEventListener("dblclick", handleDblClick)
      canvas.removeEventListener("keydown", handleKeyDown)
      canvas.removeEventListener("touchstart", handleTouch)
      gl.deleteTexture(inputTex)
      gl.deleteTexture(fboA.tex)
      gl.deleteFramebuffer(fboA.fbo)
      gl.deleteTexture(fboB.tex)
      gl.deleteFramebuffer(fboB.fbo)
      gl.deleteProgram(blurProg.program)
      gl.deleteShader(blurProg.vs)
      gl.deleteShader(blurProg.fs)
      gl.deleteProgram(unsharpProg.program)
      gl.deleteShader(unsharpProg.vs)
      gl.deleteShader(unsharpProg.fs)
      gl.deleteVertexArray(vao)
    }
  }, [])

  return (
    <div className={cn("relative", className)}>
      {isSupported ? (
        <canvas
          ref={canvasRef}
          width={RES}
          height={RES}
          tabIndex={interactive ? 0 : undefined}
          className="h-full w-full object-cover outline-none"
          style={{
            opacity: isReady ? 1 : 0,
            transition: "opacity 240ms ease-out",
            touchAction: "none",
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
          WebGL2 not supported
        </div>
      )}
    </div>
  )
}
