"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { useRequest } from "@/components/request/RequestProvider";

/**
 * Eased wheel scrolling for the whole page.
 *
 * The scroll-driven chapters (the pinned hero, the gallery, the 3D) are scrubbed
 * by scroll position. Raw wheel input arrives in coarse notches, so they would
 * jump from frame to frame; easing the scroll itself is what makes them glide.
 *
 * Off for touch (phones already scroll with momentum, and fighting it feels
 * wrong) and for anyone who has asked their system for reduced motion. Paused
 * while the request dialog is open so the page underneath stays put.
 */
export default function SmoothScroll() {
  const { isOpen } = useRequest();
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const l = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // In-page links (#services, …) glide too, and land below the fixed nav.
      anchors: { offset: -24 },
    });
    lenis.current = l;

    let raf = 0;
    const loop = (time: number) => {
      l.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      l.destroy();
      lenis.current = null;
    };
  }, []);

  useEffect(() => {
    if (isOpen) lenis.current?.stop();
    else lenis.current?.start();
  }, [isOpen]);

  return null;
}
