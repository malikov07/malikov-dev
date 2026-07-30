"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { ReactNode } from "react";
import { useRef } from "react";

/**
 * Card that tilts toward the pointer in real 3D and tracks a spotlight
 * underneath it. Children can opt into extra depth with `style={{ transform:
 * "translateZ(40px)" }}` — the wrapper preserves 3D.
 */
export default function TiltCard({
  children,
  className = "",
  intensity = 9,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees. */
  intensity?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const spring = { stiffness: 220, damping: 26, mass: 0.6 };
  const rotateX = useSpring(
    useTransform(my, [0, 1], [intensity, -intensity]),
    spring,
  );
  const rotateY = useSpring(
    useTransform(mx, [0, 1], [-intensity, intensity]),
    spring,
  );

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    mx.set(x);
    my.set(y);
    // Feed the CSS spotlight in `.spotlight`.
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };

  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className={`group pre3d relative ${className}`}
    >
      {children}
      {glare && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(340px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,.11), transparent 62%)",
          }}
        />
      )}
    </motion.div>
  );
}
