"use client";

import { useEffect } from "react";
import * as THREE from "three";

/* ==========================================================================
   Shared state for the 3D layer.

   The canvas sits behind the page with pointer-events off, so it never sees a
   pointer event of its own. One set of window listeners feeds every object in
   the scene through these module-level records instead.
   ========================================================================== */

/**
 * Where the hero object is on screen, in the aurora's coordinate space
 * (x scaled by aspect, y up, both centred). The aurora brightens a pool of light
 * here, so the glass always has something vivid behind it to refract.
 */
export const focus = { x: 0.3, y: 0, r: 0.3, amount: 0 };

export const input = {
  /** Pointer, -1..1 across the viewport, +y up. */
  px: 0,
  py: 0,
  /** Page scroll, 0..1. */
  scroll: 0,
  /** Page scroll in CSS pixels. */
  scrollY: 0,
};

/**
 * Where the hero story is, written once a frame by the device scene and read by
 * every piece of UI in it.
 */
export const story = {
  /** 0 assembled … 1 every piece floating off its screen. */
  explode: 0,
  /** 0 … 1: the "it works" moment — screens brighten, the notification lands. */
  glow: 0,
};

export function useWindowInput(onScroll?: () => void) {
  useEffect(() => {
    const move = (e: PointerEvent) => {
      input.px = (e.clientX / window.innerWidth) * 2 - 1;
      input.py = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const scroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      input.scrollY = window.scrollY;
      input.scroll = window.scrollY / max;
      onScroll?.();
    };
    scroll();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
    };
  }, [onScroll]);
}

/* ==========================================================================
   Quality tier — decided once, from what the device says about itself.
   PerformanceMonitor then trims resolution further at runtime if needed.
   ========================================================================== */

export type Tier = {
  lite: boolean;
  dpr: number;
  dust: number;
  samples: number;
  resolution: number;
};

export function detectTier(): Tier {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency ?? 4;
  const lite = coarse || small || cores <= 4;
  const dpr = window.devicePixelRatio || 1;
  return lite
    ? { lite, dpr: Math.min(dpr, 1.5), dust: 120, samples: 4, resolution: 512 }
    : { lite, dpr: Math.min(dpr, 1.75), dust: 260, samples: 8, resolution: 1024 };
}

/** Deterministic random, so the layout is the same on every visit. */
export function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const MINT = new THREE.Color("#6cf2c8");
export const BLUE = new THREE.Color("#5f8bff");
export const CORAL = new THREE.Color("#ff8f7a");
export const WHITE = new THREE.Color("#ffffff");

export const damp = THREE.MathUtils.damp;

export const smooth = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/* ==========================================================================
   The hero's choreography, by scroll progress `p` through the pinned hero.
   Keyed to the same windows as the scene text in Hero.tsx — change together:
     0.20–0.40  "You describe it"   pieces float off the screens
     0.44–0.62  "I build it"        pieces snap back into place
     0.66–0.84  "You see it work"   screens brighten, the notification lands
     0.82–1.00  the dive            the phone grows past the screen edges
   ========================================================================== */

/** Placement on screen: CSS-pixel offset from the viewport centre (+y down), and height. */
export type Place = { x: number; y: number; size: number };

const lerpPlace = (a: Place, b: Place, k: number): Place => ({
  x: a.x + (b.x - a.x) * k,
  y: a.y + (b.y - a.y) * k,
  size: a.size + (b.size - a.size) * k,
});

export const explodeAt = (p: number) => smooth(0.2, 0.34, p) * (1 - smooth(0.46, 0.6, p));
export const glowAt = (p: number) => smooth(0.64, 0.74, p);
export const diveAt = (p: number) => Math.pow(smooth(0.82, 1, p), 2.2);

export function heroPlace(p: number, W: number, H: number): Place {
  const wide = W >= 1024;
  const open: Place = wide
    ? { x: W * 0.27, y: H * 0.03, size: H * 0.58 }
    : { x: 0, y: -H * 0.25, size: Math.min(H * 0.3, W * 0.58) };
  // A touch smaller while it comes apart: the pieces travel outwards and must
  // not land on the scene text on the left.
  const stage: Place = wide
    ? { x: W * 0.27, y: 0, size: H * 0.5 }
    : { x: 0, y: -H * 0.19, size: Math.min(H * 0.32, W * 0.6) };
  const dive: Place = { x: 0, y: 0, size: H * 7 };
  return lerpPlace(lerpPlace(open, stage, smooth(0.04, 0.2, p)), dive, diveAt(p));
}

/** 1 while an anchor is well inside the viewport, easing to 0 at the edges. */
export function edgeAmount(r: DOMRect, H: number) {
  const c = r.top + r.height / 2;
  const edge = Math.min(c + r.height * 0.5, H - c + r.height * 0.5) / (r.height * 0.6);
  return THREE.MathUtils.clamp(edge, 0, 1);
}
