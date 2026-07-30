"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Hairline reading-progress bar pinned to the top of the viewport. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX, transformOrigin: "left" }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-gradient-to-r from-prism-cyan via-prism-violet to-prism-pink"
    />
  );
}
