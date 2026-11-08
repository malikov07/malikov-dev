"use client";

import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { AURORA_FRAG, AURORA_VERT } from "./aurora";
import Device from "./Device";
import {
  BLUE,
  CORAL,
  MINT,
  WHITE,
  damp,
  detectTier,
  focus,
  input,
  rng,
  useWindowInput,
} from "./story";

/* ==========================================================================
   Aurora backdrop
   ========================================================================== */

function Aurora({ reduced }: { reduced: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const size = useThree((s) => s.size);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 8 },
      uScroll: { value: 0 },
      uAspect: { value: 1 },
      uMouse: { value: new THREE.Vector2(0.3, 0.2) },
      uFocus: { value: new THREE.Vector4(0.3, 0, 0.3, 0) },
    }),
    [],
  );

  useFrame((state, dt) => {
    const u = mat.current.uniforms;
    u.uAspect.value = size.width / Math.max(1, size.height);
    u.uScroll.value = reduced ? input.scroll : damp(u.uScroll.value, input.scroll, 3.5, dt);
    // Position follows exactly (it is pinned to a scrolling DOM box); only the
    // brightness eases, so the pool fades rather than pops between anchors.
    const f = u.uFocus.value as THREE.Vector4;
    f.x = focus.x;
    f.y = focus.y;
    f.z = focus.r;
    f.w = reduced ? focus.amount : damp(f.w, focus.amount, 3, dt);
    if (reduced) return;
    u.uTime.value = 8 + state.clock.elapsedTime;
    const m = u.uMouse.value as THREE.Vector2;
    m.x = damp(m.x, input.px, 2, dt);
    m.y = damp(m.y, input.py, 2, dt);
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1000}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={AURORA_VERT}
        fragmentShader={AURORA_FRAG}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  );
}

const POINT_FRAG = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  gl_FragColor = vec4(vColor * a * vAlpha, a * vAlpha);
}
`;

/* ==========================================================================
   Dust — tiny points through the whole page, at several depths. They drift
   with scroll at a speed set by their depth, which is what sells the space as
   three-dimensional while the rest of the page is flat cards.
   ========================================================================== */

function Dust({ count, reduced }: { count: number; reduced: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;

  const { positions, colors, spans } = useMemo(() => {
    const r = rng(11);
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const span = new Float32Array(count);
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(15));
    for (let i = 0; i < count; i++) {
      const z = -9 + r() * 12;
      const dist = 12 - z;
      // Visible height at this depth, padded so wrapping happens off-screen.
      const h = 2 * dist * tanHalf * 1.25;
      pos[i * 3] = (r() - 0.5) * h * 2.4;
      pos[i * 3 + 1] = (r() - 0.5) * h;
      pos[i * 3 + 2] = z;
      span[i] = h;
      const k = r();
      // Mostly coloured: white specks on a dark field read as stars, and the
      // page should feel like a lit room, not space.
      const c = k < 0.2 ? WHITE : k < 0.5 ? MINT : k < 0.85 ? BLUE : CORAL;
      col.set([c.r, c.g, c.b], i * 3);
    }
    return { positions: pos, colors: col, spans: span };
  }, [count]);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uOffset: { value: 0 }, uSize: { value: 46 } }),
    [],
  );

  useFrame((state) => {
    if (!reduced) uniforms.uTime.value = state.clock.elapsedTime;
    // Scroll converted to world units at the z=0 plane.
    const H = state.size.height;
    const vpH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    uniforms.uOffset.value = (input.scrollY / H) * vpH;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aSpan" args={[spans, 1]} />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          uniform float uTime;
          uniform float uOffset;
          uniform float uSize;
          attribute vec3 aColor;
          attribute float aSpan;
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            vec3 p = position;
            // 0 far .. 1 near. Near dust travels faster than the page, far
            // dust slower — parallax.
            float depth = clamp((p.z + 9.0) / 12.0, 0.0, 1.0);
            float s = fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453);
            p.y = mod(p.y + uOffset * (0.25 + depth * 0.95) + aSpan * 0.5, aSpan) - aSpan * 0.5;
            p.x += sin(uTime * 0.15 + s * 6.283) * 0.2;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = uSize * (0.35 + s * 0.9) / -mv.z;
            vColor = aColor;
            vAlpha = (0.18 + 0.4 * depth) * (0.6 + 0.4 * sin(uTime * (0.5 + s) + s * 50.0));
          }
        `}
        fragmentShader={POINT_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Studio lighting for the chrome and glass, built from shapes — no HDR file. */
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      {/* Big soft panels rather than small shapes: on a sphere, a small light
          reflects as a dot, and four dots on four nodes read as faces. */}
      {/* A dim base, so chrome facing away from every panel reads as dark
          metal instead of a hole. */}
      <color attach="background" args={["#1a2340"]} />
      <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[-1, 6, -1]} rotation={[Math.PI / 2, 0, 0.35]} scale={[14, 6, 1]} />
      <Lightformer form="rect" intensity={3} color="#6cf2c8" position={[-7, 1.5, 2]} rotation={[0, Math.PI / 2, 0.5]} scale={[12, 3, 1]} />
      <Lightformer form="rect" intensity={3.4} color="#5f8bff" position={[7, -1, -1]} rotation={[0, -Math.PI / 2, -0.4]} scale={[12, 4, 1]} />
      <Lightformer form="rect" intensity={2.4} color="#ff8f7a" position={[1, -6, 2]} rotation={[-Math.PI / 2, 0, 0.6]} scale={[12, 5, 1]} />
    </Environment>
  );
}

/** Calls `onReady` once a few real frames have been drawn. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    if (++frames.current >= 3) {
      done.current = true;
      onReady();
    }
  });
  return null;
}

/** In reduced-motion mode the loop is on demand; redraw when the page moves. */
function DemandOnScroll() {
  const invalidate = useThree((s) => s.invalidate);
  useWindowInput(invalidate);
  return null;
}

function InputBridge() {
  useWindowInput();
  return null;
}

export default function Experience({
  active,
  onReady,
  onFail,
}: {
  /** False while only light chapters are on screen: nothing is drawn at all. */
  active: boolean;
  onReady: () => void;
  onFail: () => void;
}) {
  const [tier] = useState(detectTier);
  const [reduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [dpr, setDpr] = useState(tier.dpr);

  return (
    <Canvas
      dpr={dpr}
      frameloop={!active ? "never" : reduced ? "demand" : "always"}
      camera={{ position: [0, 0, 12], fov: 30, near: 0.1, far: 60 }}
      gl={{
        antialias: true,
        alpha: false,
        stencil: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#070b1d");
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onFail();
        });
      }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {/* Steps resolution down on a struggling GPU, and back up once it
          recovers — smoothness wins over sharpness. */}
      <PerformanceMonitor
        bounds={() => [45, 90]}
        flipflops={3}
        onDecline={() => setDpr((d) => Math.max(0.75, d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(tier.dpr, d + 0.25))}
        onFallback={() => setDpr(0.75)}
      />
      {reduced ? <DemandOnScroll /> : <InputBridge />}
      <Studio />
      <Aurora reduced={reduced} />
      <Dust count={tier.dust} reduced={reduced} />
      <Device tier={tier} reduced={reduced} />
      <ReadySignal onReady={onReady} />
    </Canvas>
  );
}
