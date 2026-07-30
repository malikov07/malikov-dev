"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useT } from "@/components/i18n/LocaleProvider";
import Magnetic from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import RequestButton from "./RequestButton";

export default function CtaBand() {
  const t = useT();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Slow counter-drift on the glow gives the band depth as it passes.
  const glowY = useTransform(scrollYProgress, [0, 1], ["18%", "-18%"]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.15, 0.8]);

  return (
    <section ref={ref} className="relative mx-auto w-full max-w-6xl px-5 py-24 sm:py-32">
      <Reveal direction="scale" duration={0.95}>
        <div className="glass glass-rim relative overflow-hidden rounded-[32px] px-6 py-16 text-center sm:px-12 sm:py-24">
          <motion.div
            aria-hidden
            style={{ y: glowY, scale: glowScale }}
            className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-[320px] w-[80%] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(167,139,250,.45),rgba(94,231,255,.18),transparent)] blur-[70px]"
          />

          <div className="relative">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-prism-cyan">
              {t.cta.eyebrow}
            </p>

            <h2 className="mx-auto mt-6 max-w-3xl text-balance text-[clamp(2.1rem,5.5vw,4rem)] font-medium leading-[1.02] tracking-[-0.035em]">
              <span className="text-fade">{t.cta.titleA}</span>
              <br />
              <span className="display text-prism">{t.cta.titleB}</span>
            </h2>

            <p className="mx-auto mt-6 max-w-lg text-balance text-[15px] leading-relaxed text-haze-300">
              {t.cta.lead}
            </p>

            <div className="mt-10 flex justify-center">
              <Magnetic strength={0.3}>
                <RequestButton size="lg" className="px-9">
                  {t.cta.button}
                  <span className="ml-1 text-ink-950/40">→</span>
                </RequestButton>
              </Magnetic>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
