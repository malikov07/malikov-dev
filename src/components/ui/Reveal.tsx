"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "scale" | "blur";

const OFFSET: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 34 },
  down: { y: -34 },
  left: { x: 44 },
  right: { x: -44 },
  scale: {},
  blur: {},
};

/**
 * Scroll-triggered entrance. Fires once, a little before the element is fully
 * on screen, so content is already settled by the time the reader reaches it.
 */
export function Reveal({
  children,
  delay = 0,
  direction = "up",
  duration = 0.75,
  className,
  once = true,
  immediate = false,
}: {
  children: ReactNode;
  delay?: number;
  direction?: Direction;
  duration?: number;
  className?: string;
  once?: boolean;
  /**
   * Play on mount instead of on scroll. Use for anything above the fold —
   * waiting on an intersection callback there costs a frame or two and makes
   * the first paint look unfinished.
   */
  immediate?: boolean;
}) {
  const offset = OFFSET[direction];

  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...offset,
      scale: direction === "scale" ? 0.93 : 1,
      filter: direction === "blur" ? "blur(14px)" : "blur(0px)",
    },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const trigger = immediate
    ? { animate: "show" as const }
    : {
        whileInView: "show" as const,
        viewport: { once, margin: "0px 0px -12% 0px" },
      };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      {...trigger}
    >
      {children}
    </motion.div>
  );
}

/**
 * Reveals children one after another. Pair with <RevealItem>.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y, filter: "blur(6px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Splits a heading into words and floats them in individually. Used sparingly —
 * only on the two biggest headlines, where it reads as craft rather than noise.
 */
export function RevealWords({
  text,
  className,
  wordClassName,
  delay = 0,
  immediate = false,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  immediate?: boolean;
}) {
  const words = text.split(" ");

  const trigger = immediate
    ? { animate: "show" as const }
    : {
        whileInView: "show" as const,
        viewport: { once: true, margin: "0px 0px -15% 0px" },
      };

  return (
    <motion.span
      className={className}
      initial="hidden"
      {...trigger}
      variants={{
        hidden: {},
        // Short on purpose. This is usually the largest text on the page, so a
        // long stagger visibly holds back the main paint.
        show: { transition: { staggerChildren: 0.028, delayChildren: delay } },
      }}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className={`inline-block ${wordClassName ?? ""}`}
            variants={{
              hidden: { y: "110%", opacity: 0 },
              show: {
                y: "0%",
                opacity: 1,
                transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
