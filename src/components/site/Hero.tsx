"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown, ShieldCheck, Timer, Wallet } from "lucide-react";
import { useRef, type CSSProperties } from "react";
import { useT } from "@/components/i18n/LocaleProvider";
import Magnetic from "@/components/ui/Magnetic";
import { Eyebrow } from "@/components/ui/Button";
import EnterWords from "@/components/ui/EnterWords";
import RequestButton from "./RequestButton";

export default function Hero() {
  const t = useT();
  const promises = [
    { icon: Wallet, label: t.hero.promiseA },
    { icon: Timer, label: t.hero.promiseB },
    { icon: ShieldCheck, label: t.hero.promiseC },
  ];
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // The whole block sinks and dissolves into the shader as you scroll past it.
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const blur = useTransform(scrollYProgress, [0, 1], ["blur(0px)", "blur(7px)"]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center justify-center px-5 pb-24 pt-28 sm:pt-36"
    >
      <motion.div
        style={{ y, opacity, scale, filter: blur }}
        className="relative mx-auto w-full max-w-4xl text-center"
      >
        {/* Above the fold, so the entrance is CSS-driven (see `.enter` in
            globals.css) and plays as soon as the HTML paints — it does not
            wait for hydration or for a scroll intersection. The whole cascade
            lands in about half a second. */}
        <div className="enter">
          <Eyebrow>{t.hero.eyebrow}</Eyebrow>
        </div>

        {/* The 2.5rem floor put the longest headline (Uzbek) on four lines at
            375px. 7.5vw only overtakes the floor at ~587px wide, so phones were
            always pinned to the largest size the clamp allows. */}
        <h1 className="mt-7 text-balance text-[clamp(2.1rem,7.5vw,5.25rem)] font-medium leading-[0.98] tracking-[-0.03em] sm:leading-[0.95] sm:tracking-[-0.035em]">
          <EnterWords
            text={t.hero.titleLine1}
            className="block"
            wordClassName="text-fade-word"
          />
          <span className="mt-1.5 block">
            <EnterWords
              text={t.hero.titleBuilt}
              wordClassName="text-fade-word"
              delay={0.1}
            />{" "}
            <EnterWords
              text={t.hero.titleProperly}
              className="display"
              wordClassName="text-prism"
              delay={0.14}
            />
          </span>
        </h1>

        <p
          className="enter mx-auto mt-7 max-w-xl text-balance text-[15px] leading-relaxed text-haze-200 sm:text-[17px]"
          style={{ "--enter-delay": "0.18s" } as CSSProperties}
        >
          {t.hero.lead}
        </p>

        {/* Full-width and stacked on a phone. Side by side they did not fit, so
            they wrapped into two centred pills of unequal width. */}
        <div
          className="enter mx-auto mt-9 flex w-full max-w-xs flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center"
          style={{ "--enter-delay": "0.24s" } as CSSProperties}
        >
          <Magnetic strength={0.25} className="w-full sm:w-auto">
            <RequestButton size="lg" className="w-full sm:w-auto">
              {t.hero.ctaPrimary}
              <span className="ml-0.5 text-ink-950/40">→</span>
            </RequestButton>
          </Magnetic>
          <Magnetic strength={0.18} className="w-full sm:w-auto">
            <a
              href="#work"
              className="glass sheen inline-flex h-14 w-full items-center justify-center rounded-full px-7 text-[15px] font-medium text-haze-100 transition duration-300 hover:-translate-y-0.5 hover:border-white/25 sm:w-auto"
            >
              {t.hero.ctaSecondary}
            </a>
          </Magnetic>
        </div>

        {/* A centred wrap of three left two on one row and one orphaned on the
            next. As a left-aligned column inside a centred block it reads as a
            list on a phone, and reverts to a single row from `sm` up. */}
        <ul
          className="enter mx-auto mt-10 flex w-fit flex-col items-start gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-6 sm:gap-y-3"
          style={{ "--enter-delay": "0.3s" } as CSSProperties}
        >
          {promises.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2 text-left text-[13px] text-haze-300"
            >
              <Icon
                className="size-3.5 shrink-0 text-prism-cyan"
                strokeWidth={1.8}
              />
              {label}
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.a
        href="#services"
        aria-label={t.hero.scrollDown}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 grid size-10 -translate-x-1/2 place-items-center rounded-full border border-white/10 text-haze-300 transition hover:border-white/30 hover:text-white"
      >
        <motion.span
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="size-4" />
        </motion.span>
      </motion.a>
    </section>
  );
}
