"use client";

import { motion, useScroll, type MotionValue } from "motion/react";
import { useRef } from "react";
import { useT } from "@/components/i18n/LocaleProvider";
import { useScrub } from "@/components/ui/useScrub";
import { Eyebrow } from "@/components/ui/Button";

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useScrub(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {children}{" "}
    </motion.span>
  );
}

/**
 * One statement, read as it is scrolled: each word lights from grey to ink in
 * order, so the sentence lands at reading pace rather than all at once.
 *
 * The first light chapter — it is what the hero's white wash hands over to,
 * so it starts on the same paper colour with nothing above it.
 */
export default function Manifesto() {
  const t = useT();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.82", "end 0.45"] });

  const words = t.manifesto.text.split(" ");
  const n = words.length;

  return (
    <section data-tone="light" className="relative bg-paper text-ink">
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-20 sm:pb-40 sm:pt-32">
        <Eyebrow tone="light">{t.manifesto.eyebrow}</Eyebrow>
        <div ref={ref}>
          <p className="mt-8 max-w-5xl text-[clamp(1.85rem,4.6vw,4rem)] font-extrabold leading-[1.08] tracking-[-0.035em]">
            {words.map((w, i) => (
              <Word key={i} progress={scrollYProgress} range={[i / n, (i + 1) / n]}>
                {w}
              </Word>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
