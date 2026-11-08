"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// three.js is the heaviest thing on the page, so it never blocks first paint:
// it loads after hydration, on the client only, and the static art below holds
// the frame until the first real 3D frame is drawn.
const Experience = dynamic(() => import("./Experience"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    if (!gl) return false;
    // Hand the probe context back immediately; browsers cap how many exist.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * The page's fixed 3D layer: aurora backdrop, the phone-and-browser
 * scene, and the dust.
 * Purely decorative — any failure (no WebGL, lost context) leaves the static
 * gradient in place and the page never notices.
 */
export default function Background3D() {
  const [mode, setMode] = useState<"pending" | "3d" | "static">("pending");
  const [ready, setReady] = useState(false);
  // Whether any dark chapter is on screen. Light chapters are opaque paper and
  // cover the canvas completely, so while only they are visible the 3D layer
  // stops drawing — no point spending a GPU frame nobody can see.
  const [active, setActive] = useState(true);

  useEffect(() => {
    setMode(hasWebGL() ? "3d" : "static");
  }, []);

  useEffect(() => {
    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        setActive(visible.size > 0);
      },
      // A little early, so it is already drawing as a dark chapter slides in.
      { rootMargin: "25% 0px" },
    );
    const watch = () => document.querySelectorAll("[data-tone='dark']").forEach((el) => io.observe(el));
    watch();
    return () => io.disconnect();
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-950"
    >
      {/* Static art direction matching the aurora's palette. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 65% at 78% 22%, rgba(95,139,255,.42) 0%, transparent 60%)," +
            "radial-gradient(60% 55% at 18% 30%, rgba(108,242,200,.20) 0%, transparent 62%)," +
            "radial-gradient(70% 60% at 60% 105%, rgba(255,143,122,.22) 0%, transparent 65%)," +
            "#0b1230",
        }}
      />

      {mode === "3d" && (
        <div
          className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        >
          <Experience
            active={active}
            onReady={() => setReady(true)}
            onFail={() => setMode("static")}
          />
        </div>
      )}

      {/* A fine dot grid, fading out towards the edges: gives the dark chapters
          a surface — a stage floor — instead of an empty void. */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.09)_1px,transparent_1.4px)] [background-size:26px_26px] [mask-image:radial-gradient(70%_60%_at_50%_45%,#000,transparent)]" />

      {/* Soft edge vignette so body copy sits comfortably on the aurora. */}
      <div className="absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_0%,transparent_50%,rgba(7,11,29,.5)_100%)]" />
    </div>
  );
}
