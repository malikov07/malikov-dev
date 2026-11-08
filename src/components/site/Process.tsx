"use client";

import { motion, useScroll } from "motion/react";
import { useRef } from "react";
import { useT } from "@/components/i18n/LocaleProvider";
import { useScrub } from "@/components/ui/useScrub";
import { Eyebrow } from "@/components/ui/Button";

function Step({
  index,
  title,
  body,
  meta,
}: {
  index: number;
  title: string;
  body: string;
  meta: string;
}) {
  const ref = useRef<HTMLLIElement | null>(null);
  // 0 as the step enters the lower part of the screen, 1 by the time it is
  // in the middle: the numeral fills with ink as it arrives.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "start 0.45"] });
  const clip = useScrub(scrollYProgress, [0, 1], ["inset(100% 0 0 0)", "inset(0% 0 0 0)"]);
  const textOpacity = useScrub(scrollYProgress, [0, 1], [0.25, 1]);
  const textY = useScrub(scrollYProgress, [0, 1], [24, 0]);
  const numeral = String(index + 1).padStart(2, "0");

  return (
    <li ref={ref} className="grid grid-cols-[auto_1fr] gap-6 border-t border-ink/10 py-10 sm:gap-10 sm:py-14">
      {/* Outline numeral with a solid copy on top, revealed bottom-up. */}
      <div className="font-heading relative text-[clamp(3.4rem,7.4vw,6.2rem)] font-semibold leading-[0.8] tracking-[-0.06em]">
        <span className="text-outline-ink">{numeral}</span>
        <motion.span style={{ clipPath: clip }} className="absolute inset-0 text-ink" aria-hidden>
          {numeral}
        </motion.span>
      </div>
      <motion.div style={{ opacity: textOpacity, y: textY }}>
        <span className="inline-block rounded-full bg-ink/[.06] px-3 py-1 text-[12px] font-medium text-ink-2">
          {meta}
        </span>
        <h3 className="mt-4 text-[clamp(1.3rem,2.1vw,1.8rem)] font-semibold leading-tight tracking-[-0.03em]">
          {title}
        </h3>
        <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-ink-2">{body}</p>
      </motion.div>
    </li>
  );
}

/**
 * How it works: the heading holds still on the left while the four steps scroll
 * past on the right, each numeral filling in as it reaches the middle.
 */
export default function Process() {
  const t = useT();
  const list = useRef<HTMLOListElement | null>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 0.6", "end 0.6"] });

  return (
    <section id="process" data-tone="light" className="relative scroll-mt-16 bg-paper text-ink">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-24 sm:py-36 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Eyebrow tone="light">{t.process.eyebrow}</Eyebrow>
          <h2 className="mt-6 text-balance text-[clamp(1.9rem,4vw,3.5rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
            {t.process.title}{" "}
            <span className="display font-normal tracking-[-0.02em] text-signal">{t.process.accent}</span>
          </h2>
          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-ink-2 sm:text-[17px]">{t.process.lead}</p>

          {/* Overall progress through the four steps. */}
          <div className="mt-10 hidden h-[3px] w-48 overflow-hidden rounded-full bg-ink/10 lg:block">
            <motion.div style={{ scaleX: scrollYProgress }} className="h-full origin-left bg-signal" />
          </div>
        </div>

        <ol ref={list}>
          {t.process.steps.map((s, i) => (
            <Step key={s.title} index={i} title={s.title} body={s.body} meta={s.meta} />
          ))}
        </ol>
      </div>
    </section>
  );
}
