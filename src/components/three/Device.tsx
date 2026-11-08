"use client";

import { Float, MeshTransmissionMaterial, RoundedBox, useFBO } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import {
  damp,
  diveAt,
  edgeAmount,
  explodeAt,
  focus,
  glowAt,
  heroPlace,
  input,
  story,
  type Place,
  type Tier,
} from "./story";

/* ==========================================================================
   The hero object: a phone running a Telegram shop bot, in front of a browser
   window showing a website — the two things this studio builds.

   Each screen is a flat texture with the static parts (header, nav, input bar)
   and faint dashed slots; the interesting parts — chat bubbles, the product
   card, the hero image, the button, the cards — are separate 3D slabs sitting
   in those slots. That is what lets the hero tell its story: the pieces float
   off the screens ("you describe it"), then snap back ("I build it").

   Everything is drawn from shapes and colours, never words, so nothing in it
   needs translating.
   ========================================================================== */

const INK = "#0b0c0f";
const SKY = "#1d9bf0";
const SIGNAL = "#2a5cff";
const SUN = "#ffb52e";
const MINT_HEX = "#10b58a";

/** Phone and browser placement inside the group, chosen so the pair is centred. */
const PHONE_POS = new THREE.Vector3(-1.25, -0.3, 0.75);
const BROWSER_POS = new THREE.Vector3(0.3, 0.55, -0.9);
const PHONE = { w: 1.9, h: 3.9, d: 0.22, screenW: 1.76, screenH: 3.72 };
const BROWSER = { w: 4.0, h: 2.7, d: 0.1, screenW: 3.86, screenH: 2.56 };
/** Height of the pair in world units, used to size it in CSS pixels. */
const GROUP_HEIGHT = 4.7;

/* ------------------------------------------------------------- geometry */

function roundedShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

const slabCache = new Map<string, THREE.BufferGeometry>();
/** A thin rounded tile with softened edges — the shape of every UI piece. */
function slab(w: number, h: number, r: number, d = 0.035) {
  const key = [w, h, r, d].join();
  let g = slabCache.get(key);
  if (!g) {
    const bevel = Math.min(0.018, r * 0.5);
    g = new THREE.ExtrudeGeometry(roundedShape(w - bevel * 2, h - bevel * 2, Math.max(0.001, r - bevel)), {
      depth: d,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 10,
    });
    g.translate(0, 0, -d / 2);
    slabCache.set(key, g);
  }
  return g;
}

/* ------------------------------------------------------------- textures */

type Ctx = CanvasRenderingContext2D;

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, fill?: string) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
}

/** A dashed outline where a floating piece belongs, so its absence reads as a slot. */
function slot(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.save();
  ctx.setLineDash([10, 9]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(11,12,15,.16)";
  rr(ctx, x, y, w, h, r);
  ctx.stroke();
  ctx.restore();
}

function makeTexture(w: number, h: number, draw: (ctx: Ctx) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Maps a piece's centre and size (screen units, centred) to texture pixels. */
function toPx(x: number, y: number, w: number, h: number, sw: number, sh: number, cw: number, ch: number) {
  const pw = (w / sw) * cw;
  const ph = (h / sh) * ch;
  return [(x / sw + 0.5) * cw - pw / 2, (0.5 - y / sh) * ch - ph / 2, pw, ph] as const;
}

type Spec = { x: number; y: number; w: number; h: number; r: number };

const PHONE_PIECES: Record<string, Spec> = {
  bot: { x: -0.22, y: 1.02, w: 1.15, h: 0.42, r: 0.14 },
  card: { x: -0.17, y: 0.1, w: 1.25, h: 1.3, r: 0.12 },
  user: { x: 0.33, y: -0.84, w: 0.95, h: 0.32, r: 0.13 },
  paid: { x: -0.28, y: -1.3, w: 1.0, h: 0.32, r: 0.13 },
};

const BROWSER_PIECES: Record<string, Spec> = {
  image: { x: 0.92, y: 0.16, w: 1.45, h: 1.0, r: 0.08 },
  cta: { x: -1.2, y: -0.34, w: 0.7, h: 0.2, r: 0.1 },
  c1: { x: -1.25, y: -0.92, w: 1.12, h: 0.4, r: 0.06 },
  c2: { x: 0, y: -0.92, w: 1.12, h: 0.4, r: 0.06 },
  c3: { x: 1.25, y: -0.92, w: 1.12, h: 0.4, r: 0.06 },
};

function usePhoneTexture() {
  return useMemo(
    () =>
      makeTexture(640, 1352, (ctx) => {
        const W = 640;
        const H = 1352;
        ctx.fillStyle = "#e7edf5";
        ctx.fillRect(0, 0, W, H);
        // Status bar
        rr(ctx, 44, 38, 70, 16, 8, INK);
        rr(ctx, 520, 38, 76, 16, 8, "rgba(11,12,15,.5)");
        // Chat header
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 84, W, 128);
        ctx.beginPath();
        ctx.arc(92, 148, 36, 0, Math.PI * 2);
        ctx.fillStyle = SKY;
        ctx.fill();
        rr(ctx, 146, 124, 210, 22, 11, INK);
        rr(ctx, 146, 158, 130, 14, 7, "rgba(29,155,240,.45)");
        // Slots for the floating pieces
        for (const s of Object.values(PHONE_PIECES)) {
          const [x, y, w, h] = toPx(s.x, s.y, s.w, s.h, PHONE.screenW, PHONE.screenH, W, H);
          slot(ctx, x, y, w, h, (s.r / PHONE.screenW) * W);
        }
        // Composer
        rr(ctx, 28, 1236, 584, 80, 40, "#ffffff");
        rr(ctx, 64, 1268, 300, 16, 8, "rgba(11,12,15,.14)");
        ctx.beginPath();
        ctx.arc(568, 1276, 28, 0, Math.PI * 2);
        ctx.fillStyle = SKY;
        ctx.fill();
      }),
    [],
  );
}

function useBrowserTexture() {
  return useMemo(
    () =>
      makeTexture(1024, 680, (ctx) => {
        const W = 1024;
        const H = 680;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, W, H);
        // Window chrome
        ctx.fillStyle = "#eef1f6";
        ctx.fillRect(0, 0, W, 54);
        ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
          ctx.beginPath();
          ctx.arc(30 + i * 24, 27, 8, 0, Math.PI * 2);
          ctx.fillStyle = c;
          ctx.fill();
        });
        rr(ctx, 360, 14, 304, 26, 13, "#ffffff");
        rr(ctx, 380, 23, 140, 8, 4, "rgba(11,12,15,.18)");
        // Nav
        rr(ctx, 48, 84, 30, 30, 8, SIGNAL);
        [0, 1, 2].forEach((i) => rr(ctx, 560 + i * 86, 93, 62, 12, 6, "rgba(11,12,15,.2)"));
        rr(ctx, 874, 82, 104, 34, 17, INK);
        // Headline and copy
        rr(ctx, 54, 166, 420, 34, 10, INK);
        rr(ctx, 54, 214, 330, 34, 10, INK);
        rr(ctx, 54, 270, 400, 13, 6, "rgba(11,12,15,.18)");
        rr(ctx, 54, 294, 340, 13, 6, "rgba(11,12,15,.18)");
        for (const s of Object.values(BROWSER_PIECES)) {
          const [x, y, w, h] = toPx(s.x, s.y, s.w, s.h, BROWSER.screenW, BROWSER.screenH, W, H);
          slot(ctx, x, y, w, h, (s.r / BROWSER.screenW) * W);
        }
      }),
    [],
  );
}

/* ---------------------------------------------------------------- pieces */

const materialCache = new Map<string, THREE.MeshStandardMaterial>();
function flat(color: string, glow = 0.3) {
  const key = `${color}:${glow}`;
  let m = materialCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.38,
      metalness: 0,
      emissive: color,
      emissiveIntensity: glow,
    });
    materialCache.set(key, m);
  }
  return m;
}

/** A text line on a piece: a flat bar just above its surface. */
function Line({
  x,
  y,
  w,
  h = 0.05,
  color = INK,
  opacity = 0.18,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  color?: string;
  opacity?: number;
}) {
  return (
    <mesh position={[x, y, 0.04]} geometry={slab(w, h, h / 2, 0.004)}>
      <meshBasicMaterial color={color} transparent={opacity < 1} opacity={opacity} toneMapped={false} />
    </mesh>
  );
}

/** A rounded screen whose UVs run 0..1 across it, so a texture maps edge to edge. */
function screenGeometry(w: number, h: number, r: number) {
  const g = new THREE.ShapeGeometry(roundedShape(w, h, r), 12);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  }
  uv.needsUpdate = true;
  return g;
}

/**
 * One floating piece of UI. Sits in its slot when the story is assembled and
 * drifts out along `away`, tumbling, as the story comes apart.
 */
function Piece({
  spec,
  color,
  away,
  tumble,
  children,
}: {
  spec: Spec;
  color: string;
  away: [number, number, number];
  tumble: [number, number, number];
  children?: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const e = story.explode;
    const t = state.clock.elapsedTime;
    ref.current.position.set(spec.x + away[0] * e, spec.y + away[1] * e, 0.13 + away[2] * e);
    ref.current.rotation.set(
      tumble[0] * e + Math.sin(t * 0.8 + spec.x * 4) * 0.12 * e,
      tumble[1] * e,
      tumble[2] * e,
    );
  });
  return (
    <group ref={ref} position={[spec.x, spec.y, 0.13]}>
      <mesh geometry={slab(spec.w, spec.h, spec.r)} material={flat(color)} />
      {children}
    </group>
  );
}

function Phone() {
  const screenTex = usePhoneTexture();
  const screenGeo = useMemo(() => screenGeometry(PHONE.screenW, PHONE.screenH, 0.2), []);
  const screen = useRef<THREE.MeshBasicMaterial>(null!);
  const note = useRef<THREE.Group>(null!);
  const p = PHONE_PIECES;

  useFrame(() => {
    // The screen dims a touch while it is "unbuilt" and lights up when it works.
    const k = 0.84 + 0.16 * (1 - story.explode) + 0.12 * story.glow;
    screen.current.color.setScalar(Math.min(1.08, k));
    const g = story.glow;
    note.current.scale.setScalar(Math.max(0.0001, g));
    note.current.position.set(0.62, 2.25 + 0.25 * g, 0.5 + 0.5 * g);
  });

  return (
    <group>
      <RoundedBox args={[PHONE.w, PHONE.h, PHONE.d]} radius={0.27} smoothness={6} bevelSegments={6}>
        <meshPhysicalMaterial color="#20232a" metalness={0.85} roughness={0.3} clearcoat={0.7} clearcoatRoughness={0.2} />
      </RoundedBox>
      <mesh position={[0, 0, PHONE.d / 2 + 0.002]} geometry={screenGeo}>
        <meshBasicMaterial ref={screen} map={screenTex} toneMapped={false} />
      </mesh>
      {/* Dynamic island */}
      <mesh position={[0, PHONE.screenH / 2 - 0.13, PHONE.d / 2 + 0.006]} geometry={slab(0.42, 0.12, 0.06, 0.004)}>
        <meshBasicMaterial color="#000" />
      </mesh>
      {/* Camera bump on the back, for the moments it turns. */}
      <mesh position={[-0.42, 1.4, -PHONE.d / 2 - 0.03]} geometry={slab(0.8, 0.8, 0.2, 0.05)}>
        <meshPhysicalMaterial color="#2a2e36" metalness={0.8} roughness={0.25} />
      </mesh>

      <Piece spec={p.bot} color="#ffffff" away={[-1.1, 0.6, 1.4]} tumble={[0.3, -0.6, 0.25]}>
        <Line x={-0.12} y={0.07} w={0.8} />
        <Line x={-0.24} y={-0.08} w={0.55} />
      </Piece>
      <Piece spec={p.card} color="#ffffff" away={[-1.6, -0.2, 2.1]} tumble={[-0.2, 0.7, -0.3]}>
        <mesh position={[0, 0.27, 0.03]} geometry={slab(1.13, 0.64, 0.08, 0.02)} material={flat(SUN, 0.35)} />
        <Line x={-0.25} y={-0.22} w={0.55} opacity={1} />
        <Line x={-0.37} y={-0.36} w={0.3} />
        <mesh position={[0.33, -0.42, 0.04]} geometry={slab(0.42, 0.18, 0.09, 0.02)} material={flat(SKY, 0.4)} />
      </Piece>
      <Piece spec={p.user} color={SKY} away={[1.0, -0.4, 1.6]} tumble={[0.4, 0.5, -0.4]}>
        <Line x={0} y={0} w={0.6} color="#ffffff" opacity={1} />
      </Piece>
      <Piece spec={p.paid} color="#ffffff" away={[-0.6, -1.1, 1.2]} tumble={[-0.5, -0.3, 0.5]}>
        <mesh position={[-0.33, 0, 0.04]}>
          <circleGeometry args={[0.09, 24]} />
          <meshBasicMaterial color={MINT_HEX} toneMapped={false} />
        </mesh>
        <Line x={0.1} y={0} w={0.55} />
      </Piece>

      {/* "It works": an order notification lands above the phone. */}
      <group ref={note} scale={0.0001}>
        <mesh geometry={slab(1.4, 0.44, 0.16, 0.05)} material={flat("#ffffff", 0.35)} />
        <mesh position={[-0.47, 0, 0.05]}>
          <circleGeometry args={[0.13, 24]} />
          <meshBasicMaterial color={SKY} toneMapped={false} />
        </mesh>
        <Line x={0.12} y={0.07} w={0.75} opacity={1} />
        <Line x={-0.04} y={-0.09} w={0.42} color={MINT_HEX} opacity={1} />
      </group>
    </group>
  );
}

function Browser() {
  const screenTex = useBrowserTexture();
  const screen = useRef<THREE.MeshBasicMaterial>(null!);
  const b = BROWSER_PIECES;

  useFrame(() => {
    const k = 0.84 + 0.16 * (1 - story.explode) + 0.1 * story.glow;
    screen.current.color.setScalar(Math.min(1.06, k));
  });

  return (
    <group>
      <RoundedBox args={[BROWSER.w, BROWSER.h, BROWSER.d]} radius={0.05} smoothness={4}>
        <meshPhysicalMaterial color="#d9dee7" metalness={0.5} roughness={0.32} clearcoat={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, BROWSER.d / 2 + 0.002]}>
        <planeGeometry args={[BROWSER.screenW, BROWSER.screenH]} />
        <meshBasicMaterial ref={screen} map={screenTex} toneMapped={false} />
      </mesh>

      <Piece spec={b.image} color={SIGNAL} away={[1.3, 0.9, 1.8]} tumble={[0.3, -0.7, 0.2]}>
        <mesh position={[0.3, 0.2, 0.04]}>
          <circleGeometry args={[0.13, 28]} />
          <meshBasicMaterial color="#ffd36b" toneMapped={false} />
        </mesh>
        <mesh position={[-0.12, -0.2, 0.035]} geometry={slab(1.1, 0.36, 0.06, 0.01)} material={flat("#6f93ff", 0.5)} />
      </Piece>
      <Piece spec={b.cta} color={SIGNAL} away={[-0.7, -0.3, 2.4]} tumble={[0.5, 0.4, 0.6]} />
      <Piece spec={b.c1} color="#eef2f8" away={[-0.9, -1.0, 1.3]} tumble={[-0.6, 0.3, -0.2]}>
        <Line x={-0.1} y={0} w={0.7} />
      </Piece>
      <Piece spec={b.c2} color="#eef2f8" away={[0.1, -1.3, 1.9]} tumble={[0.6, -0.2, 0.3]}>
        <Line x={-0.1} y={0} w={0.7} />
      </Piece>
      <Piece spec={b.c3} color="#eef2f8" away={[1.1, -0.9, 1.4]} tumble={[-0.3, -0.5, -0.4]}>
        <Line x={-0.1} y={0} w={0.7} />
      </Piece>
    </group>
  );
}

/* ------------------------------------------------------------- the scene */

/**
 * The phone and browser pair, plus the glass that floats around them.
 *
 * Two places it can be:
 * - the pinned hero (`[data-hero-scene]`), where scroll progress decides where
 *   it is, how big, how far apart the UI is, and finally the dive into the
 *   phone's screen;
 * - any `[data-three-anchor]` box on screen (the closing call to action), where
 *   it fits itself to the box and scrolls with the page.
 * Anywhere else it is hidden and its glass pass is skipped.
 */
export default function Device({ tier, reduced }: { tier: Tier; reduced: boolean }) {
  const outer = useRef<THREE.Group>(null!);
  const inner = useRef<THREE.Group>(null!);
  const phone = useRef<THREE.Group>(null!);
  const browser = useRef<THREE.Group>(null!);
  const glassGroup = useRef<THREE.Group>(null!);
  const hero = useRef<HTMLElement | null>(null);
  const anchors = useRef<HTMLElement[]>([]);
  const lastQuery = useRef(-1);
  const born = useRef<number | null>(null);
  const progress = useRef(0);

  // One buffer for both glass objects: the scene behind them, rendered once a
  // frame below. Each material is handed this instead of making its own.
  const fbo = useFBO(tier.resolution, tier.resolution);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const { width: W, height: H } = state.size;

    if (t - lastQuery.current > 1 || !hero.current) {
      hero.current = document.querySelector<HTMLElement>("[data-hero-scene]");
      anchors.current = Array.from(document.querySelectorAll<HTMLElement>("[data-three-anchor]"));
      lastQuery.current = t;
    }

    let place: Place | null = null;
    let glow = 1;
    let dive = 0;
    let heroMode = false;
    story.explode = 0;
    story.glow = 0;

    const hr = hero.current?.getBoundingClientRect();
    if (hr && hr.bottom > 0 && hr.top < H) {
      const raw = THREE.MathUtils.clamp(-hr.top / Math.max(1, hr.height - H), 0, 1);
      progress.current = reduced ? raw : damp(progress.current, raw, 7, dt);
      const p = progress.current;
      // Fully washed out by the end — stop drawing it before the hero scrolls away.
      if (p < 0.995) {
        heroMode = true;
        place = heroPlace(p, W, H);
        story.explode = reduced ? 0 : explodeAt(p);
        story.glow = glowAt(p);
        dive = diveAt(p);
        glow = 1 + 0.6 * story.glow;
      }
    }

    if (!place) {
      for (const el of anchors.current) {
        const r = el.getBoundingClientRect();
        if (r.height > 0 && r.bottom > -r.height * 0.15 && r.top < H + r.height * 0.15) {
          const scale = Number(el.dataset.threeScale ?? 1);
          place = {
            x: r.left + r.width / 2 - W / 2,
            y: r.top + r.height / 2 - H / 2,
            size: Math.min(r.height, r.width / 1.25) * scale,
          };
          glow = edgeAmount(r, H);
          story.glow = 1;
          break;
        }
      }
    }

    outer.current.visible = place !== null;
    if (!place) {
      focus.amount = 0;
      return;
    }

    if (born.current === null) born.current = t;
    const intro = reduced ? 1 : Math.min(1, (t - born.current) / 2.2);
    const e = 1 - Math.pow(1 - intro, 4);

    const vp = state.viewport.getCurrentViewport(state.camera, [0, 0, 0]);
    const upp = vp.height / H;
    outer.current.position.set(place.x * upp, -place.y * upp, 0);
    outer.current.scale.setScalar(((place.size * upp) / GROUP_HEIGHT) * (0.7 + 0.3 * e));

    focus.x = place.x / H;
    focus.y = -place.y / H;
    focus.r = (Math.min(place.size, H * 1.2) / H) * 0.6;
    focus.amount = glow;

    // The two devices drift apart a little as the UI comes apart, and during
    // the dive the group recentres on the phone so the camera goes into it.
    const x = story.explode;
    phone.current.position.copy(PHONE_POS).add(new THREE.Vector3(-0.35 * x, -0.1 * x, 0.7 * x));
    browser.current.position.copy(BROWSER_POS).add(new THREE.Vector3(0.45 * x, 0.25 * x, -0.7 * x));
    inner.current.position.set(-PHONE_POS.x * dive, -PHONE_POS.y * dive, 0);

    if (reduced) {
      inner.current.rotation.set(0.05, -0.32, 0);
    } else {
      // Turned slightly towards the copy, following the pointer; it turns more
      // while apart so the depth between the pieces reads.
      const base = heroMode ? -0.3 : -0.18;
      const ry = base + input.px * 0.22 + x * 0.42 - (1 - e) * 1.1 + Math.sin(t * 0.35) * 0.06 - dive * 0.3;
      const rx = -input.py * 0.12 + 0.04 + x * 0.16;
      inner.current.rotation.y = damp(inner.current.rotation.y, ry, 4, dt);
      inner.current.rotation.x = damp(inner.current.rotation.x, rx, 4, dt);
      inner.current.rotation.z = Math.sin(t * 0.3) * 0.02;
    }

    // The glass pass: everything except the glass, into the shared buffer.
    // Tone mapping off so the buffer is not tone-mapped twice.
    const gl = state.gl;
    const tone = gl.toneMapping;
    glassGroup.current.visible = false;
    gl.toneMapping = THREE.NoToneMapping;
    gl.setRenderTarget(fbo);
    gl.render(state.scene, state.camera);
    gl.setRenderTarget(null);
    gl.toneMapping = tone;
    glassGroup.current.visible = true;
  });

  const glass = (
    <MeshTransmissionMaterial
      buffer={fbo.texture}
      // Its own buffers go unused (it is handed `buffer`), so keep them tiny.
      resolution={1}
      backsideResolution={1}
      samples={tier.samples}
      thickness={0.9}
      roughness={0.03}
      ior={1.45}
      chromaticAberration={0.6}
      anisotropicBlur={0.15}
      distortion={0.2}
      distortionScale={0.4}
      temporalDistortion={reduced ? 0 : 0.06}
      iridescence={1}
      iridescenceIOR={1.3}
      iridescenceThicknessMinimum={180}
      iridescenceThicknessMaximum={760}
      clearcoat={1}
      color="#f6fbff"
      attenuationColor="#eaf3ff"
      attenuationDistance={6}
    />
  );

  return (
    <group ref={outer} visible={false}>
      <group ref={inner}>
        <group ref={browser} position={BROWSER_POS} rotation={[0, -0.22, 0]}>
          <Browser />
        </group>
        <group ref={phone} position={PHONE_POS} rotation={[0, 0.14, 0]}>
          <Phone />
        </group>

        <group ref={glassGroup}>
          <Float speed={1.3} rotationIntensity={1.2} floatIntensity={1.1}>
            <mesh position={[-2.45, 1.75, 1.5]} rotation={[0.6, 0.4, 0]}>
              <torusGeometry args={[0.5, 0.19, tier.lite ? 32 : 64, tier.lite ? 64 : 128]} />
              {glass}
            </mesh>
          </Float>
          <Float speed={1.6} rotationIntensity={0.4} floatIntensity={1.4}>
            <mesh position={[2.35, -1.7, 1.2]}>
              <sphereGeometry args={[0.42, tier.lite ? 40 : 64, tier.lite ? 30 : 48]} />
              {glass}
            </mesh>
          </Float>
        </group>

        <Float speed={2} floatIntensity={2}>
          <mesh position={[2.6, 1.9, 0.4]}>
            <sphereGeometry args={[0.11, 24, 24]} />
            <meshStandardMaterial color="#6cf2c8" emissive="#6cf2c8" emissiveIntensity={1.6} toneMapped={false} />
          </mesh>
        </Float>
        <Float speed={2.3} floatIntensity={2.2}>
          <mesh position={[-2.5, -2.0, 0.9]}>
            <sphereGeometry args={[0.09, 24, 24]} />
            <meshStandardMaterial color="#ff8f7a" emissive="#ff8f7a" emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
        </Float>
      </group>
    </group>
  );
}
