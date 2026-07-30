"use client";

import { useEffect, useRef, useState } from "react";
import { FRAGMENT_SRC, VERTEX_SRC } from "./shader";

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("[liquid] shader compile failed:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

/**
 * Full-viewport animated background. Renders behind everything and is purely
 * decorative, so any failure (no WebGL, lost context, reduced motion) falls
 * back to a static CSS gradient without the page noticing.
 */
export default function LiquidBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const gl = (canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    }) ?? canvas.getContext("webgl", { alpha: false, antialias: false })) as
      | WebGLRenderingContext
      | null;

    if (!gl) {
      setFailed(true);
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      setFailed(true);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("[liquid] link failed:", gl.getProgramInfoLog(program));
      setFailed(true);
      return;
    }
    gl.useProgram(program);

    // One oversized triangle covers the viewport with no index buffer and no
    // diagonal seam, which a two-triangle quad can show under heavy shading.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uStretch = gl.getUniformLocation(program, "u_stretch");
    const uScroll = gl.getUniformLocation(program, "u_scroll");
    const uIntensity = gl.getUniformLocation(program, "u_intensity");

    // Render scale adapts down if the GPU can't keep up (see the frame loop).
    let scale = Math.min(window.devicePixelRatio || 1, 1.6);
    let width = 0;
    let height = 0;

    const resize = () => {
      const w = Math.max(1, Math.floor(window.innerWidth * scale));
      const h = Math.max(1, Math.floor(window.innerHeight * scale));
      if (w === width && h === height) return;
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };
    resize();

    // Pointer and scroll are eased toward their targets so the glass has
    // weight instead of snapping.
    const target = { x: 0.42, y: 0.12 };
    const eased = { x: 0.42, y: 0.12 };
    const prev = { x: 0.42, y: 0.12 };
    const velocity = { x: 0, y: 0 };
    let scrollTarget = 0;
    let scrollEased = 0;

    // Last known viewport position of the pointer. Kept so a scroll can
    // re-derive the field position without waiting for a pointermove — the
    // pointer stays put on screen while the page moves underneath it.
    let clientX = -1;
    let clientY = -1;

    const setTargetFromClient = () => {
      if (clientX < 0) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      target.x = (clientX - w / 2) / h;
      target.y = -(clientY - h / 2) / h;
    };

    const onPointer = (e: PointerEvent) => {
      clientX = e.clientX;
      clientY = e.clientY;
      setTargetFromClient();
    };
    const onScroll = () => {
      const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
      scrollTarget = window.scrollY / max;
      setTargetFromClient();
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    onScroll();

    let raf = 0;
    let running = true;
    const start = performance.now();
    let slowFrames = 0;
    let last = start;

    const frame = (now: number) => {
      if (!running) return;
      const dt = now - last;
      last = now;

      // If we spend more than ~28ms/frame repeatedly, drop resolution once.
      if (dt > 28 && scale > 0.75) {
        slowFrames++;
        if (slowFrames > 45) {
          scale = Math.max(0.75, scale - 0.35);
          slowFrames = 0;
          width = height = 0;
          resize();
        }
      } else if (slowFrames > 0) {
        slowFrames--;
      }

      eased.x += (target.x - eased.x) * 0.045;
      eased.y += (target.y - eased.y) * 0.045;
      scrollEased += (scrollTarget - scrollEased) * 0.06;

      // Per-frame travel, low-pass filtered. Raw deltas are jittery enough
      // that the blob would flicker between shapes.
      const dx = eased.x - prev.x;
      const dy = eased.y - prev.y;
      prev.x = eased.x;
      prev.y = eased.y;
      velocity.x += (dx - velocity.x) * 0.18;
      velocity.y += (dy - velocity.y) * 0.18;

      // Cap it, or a fast flick across the screen smears the blob edge to edge.
      const GAIN = 9;
      const MAX = 0.42;
      let sx = velocity.x * GAIN;
      let sy = velocity.y * GAIN;
      const mag = Math.hypot(sx, sy);
      if (mag > MAX) {
        sx = (sx / mag) * MAX;
        sy = (sy / mag) * MAX;
      }

      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, eased.x, eased.y);
      gl.uniform2f(uStretch, sx, sy);
      gl.uniform1f(uScroll, scrollEased);
      gl.uniform1f(uIntensity, 1.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(frame);
    };

    if (reduced) {
      // Draw a single representative frame and stop.
      gl.uniform1f(uTime, 8.0);
      gl.uniform2f(uMouse, 0.42, 0.12);
      gl.uniform2f(uStretch, 0, 0);
      gl.uniform1f(uScroll, 0);
      gl.uniform1f(uIntensity, 1.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      raf = requestAnimationFrame(frame);
    }

    // Don't burn battery in a background tab.
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduced && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onLost = (e: Event) => {
      e.preventDefault();
      running = false;
      cancelAnimationFrame(raf);
      setFailed(true);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-950"
    >
      {/* Static art direction that matches the shader, shown until/unless
          WebGL takes over. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 22% 12%, #241a55 0%, transparent 60%)," +
            "radial-gradient(70% 60% at 82% 28%, #0d4a63 0%, transparent 62%)," +
            "radial-gradient(80% 70% at 50% 100%, #3a1150 0%, transparent 65%)," +
            "#04050a",
        }}
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
          failed ? "opacity-0" : "opacity-100"
        }`}
      />
      {/* Darkening scrim: the shader is vivid, and body copy has to sit on it. */}
      <div className="absolute inset-0 bg-[radial-gradient(125%_95%_at_50%_0%,transparent_45%,rgba(4,5,10,.55)_100%)]" />
    </div>
  );
}
