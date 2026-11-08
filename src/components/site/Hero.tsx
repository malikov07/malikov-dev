"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ShieldCheck, Timer, Wallet } from "lucide-react";
import { useRef, type CSSProperties } from "react";
import { useT } from "@/components/i18n/LocaleProvider";
import { useScrub } from "@/components/ui/useScrub";
import Magnetic from "@/components/ui/Magnetic";
import { Eyebrow } from "@/components/ui/Button";
import EnterWords from "@/components/ui/EnterWords";
import RequestButton from "./RequestButton";

/**
 * Scroll windows for the three scenes, as fractions of the pinned hero. The 3D
 * layer keys off the same progress (see `heroPlace` / `explodeAt` in
 * story.ts): the UI floats off the screens during the first, snaps back
 * during the second, and glows during the third.
 */
const SCENES: [number, number][] = [
  [0.2, 0.4],
  [0.44, 0.62],
  [0.66, 0.84],
];

function Scene({
  progress,
  range: [a, b],
  label,
  text,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  label: string;
  text: string;
}) {
  const opacity = useScrub(progress, [a, a + 0.05, b - 0.05, b], [0, 1, 1, 0]);
  const y = useScrub(progress, [a, a + 0.06, b - 0.06, b], [60, 0, 0, -60]);
  const blur = useScrub(
    progress,
    [a, a + 0.05, b - 0.05, b],
    ["blur(12px)", "blur(0px)", "blur(0px)", "blur(12px)"],
  );

  return (
    <motion.div
      style={{ opacity, y, filter: blur }}
      className="pointer-events-none absolute inset-x-0 bottom-[11svh] px-5 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
    >
      <div className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-prism-a">{label}</p>
        <p className="mt-4 max-w-[15ch] text-balance font-heading text-[clamp(2.1rem,5.8vw,5.2rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-white lg:max-w-[52%]">
          {text}
        </p>
      </div>
    </motion.div>
  );
}

/** One segment of the progress bar under the scenes. */
function Segment({ progress, range: [a, b] }: { progress: MotionValue<number>; range: [number, number] }) {
  const scaleX = useScrub(progress, [a, b], [0, 1]);
  return (
    <span className="relative h-[3px] w-10 overflow-hidden rounded-full bg-white/15 sm:w-14">
      <motion.span style={{ scaleX }} className="absolute inset-0 origin-left rounded-full bg-white" />
    </span>
  );
}

export default function Hero() {
  const t = useT();
  const promises = [
    { icon: Wallet, label: t.hero.promiseA },
    { icon: Timer, label: t.hero.promiseB },
    { icon: ShieldCheck, label: t.hero.promiseC },
  ];

  const ref = useRef<HTMLElement | null>(null);
  // 0 when the hero pins, 1 when it lets go.
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // The opening frame steps back into the scene as the first scroll begins.
  const openOpacity = useScrub(p, [0, 0.15], [1, 0]);
  const openY = useScrub(p, [0, 0.16], [0, -90]);
  const openScale = useScrub(p, [0, 0.16], [1, 0.94]);
  const openBlur = useScrub(p, [0, 0.16], ["blur(0px)", "blur(10px)"]);
  const openEvents = useTransform(p, (v) => (v > 0.1 ? "none" : "auto"));

  const hintOpacity = useScrub(p, [0, 0.06], [1, 0]);
  const barOpacity = useScrub(p, [0.17, 0.22, 0.82, 0.87], [0, 1, 1, 0]);
  // The dive: the phone grows past the screen and the page washes to paper,
  // handing over to the light chapter that follows without a seam.
  const wash = useScrub(p, [0.88, 0.99], [0, 1]);

  return (
    <section
      ref={ref}
      data-tone="dark"
      data-hero-scene
      className="relative h-[330svh]"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* ---------------------------------------------------------- Opening */}
        <motion.div
          style={{ opacity: openOpacity, y: openY, scale: openScale, filter: openBlur, pointerEvents: openEvents }}
          className="absolute inset-0 flex items-end px-5 pb-[9svh] lg:items-center lg:pb-0"
        >
          <div className="mx-auto grid w-full max-w-6xl lg:grid-cols-[1.12fr_0.88fr]">
            <div className="text-center lg:text-left">
              {/* Above the fold, so the entrance is CSS-driven (see `.enter` in
                  globals.css) and plays as soon as the HTML paints. */}
              <div className="enter">
                <Eyebrow>{t.hero.eyebrow}</Eyebrow>
              </div>

              <h1 className="mt-6 text-balance text-[clamp(1.9rem,7vw,3.8rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-white sm:mt-7 lg:text-[clamp(2.7rem,4.1vw,4.2rem)] lg:leading-[0.92] lg:tracking-[-0.05em]">
                <EnterWords text={t.hero.titleLine1} className="block" />
                <span className="mt-1 block">
                  <EnterWords text={t.hero.titleBuilt} delay={0.1} />{" "}
                  <EnterWords
                    text={t.hero.titleProperly}
                    className="display font-normal tracking-[-0.02em]"
                    wordClassName="text-prism-a"
                    delay={0.14}
                  />
                </span>
              </h1>

              <p
                className="enter mx-auto mt-6 max-w-xl text-balance text-[15px] leading-relaxed text-haze-200 sm:mt-7 sm:text-[18px] lg:mx-0"
                style={{ "--enter-delay": "0.18s" } as CSSProperties}
              >
                {t.hero.lead}
              </p>

              <div
                className="enter mx-auto mt-8 flex w-full max-w-xs flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start"
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
                    className="inline-flex h-14 w-full items-center justify-center rounded-full border border-white/18 bg-white/[.04] px-7 text-[15px] font-medium text-white backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[.08] sm:w-auto"
                  >
                    {t.hero.ctaSecondary}
                  </a>
                </Magnetic>
              </div>

              <ul
                className="enter mx-auto mt-8 hidden w-fit flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:flex lg:mx-0 lg:justify-start"
                style={{ "--enter-delay": "0.3s" } as CSSProperties}
              >
                {promises.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2 text-[13px] text-haze-300">
                    <Icon className="size-3.5 shrink-0 text-prism-a" strokeWidth={1.8} />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* ----------------------------------------------------------- Scenes */}
        {t.dive.scenes.map((scene, i) => (
          <Scene key={scene.label} progress={p} range={SCENES[i]} label={scene.label} text={scene.text} />
        ))}

        <motion.div
          style={{ opacity: barOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-[5svh] flex justify-center gap-2"
          aria-hidden
        >
          {SCENES.map((range, i) => (
            <Segment key={i} progress={p} range={range} />
          ))}
        </motion.div>

        {/* Scroll cue — the hero is pinned, so it has to invite the scroll. */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-5 hidden flex-col items-center gap-3 text-[12px] text-haze-300 sm:flex"
        >
          <span>{t.dive.hint}</span>
          <span className="relative h-10 w-px overflow-hidden bg-white/15">
            <motion.span
              className="absolute inset-x-0 top-0 h-1/2 bg-white"
              animate={{ y: ["-100%", "200%"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </motion.div>

        <motion.div style={{ opacity: wash }} className="paper-surface pointer-events-none absolute inset-0" />
      </div>
    </section>
  );
}
