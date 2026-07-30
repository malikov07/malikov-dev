"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { CheckCircle2, Hammer, MessagesSquare, PartyPopper } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRef } from "react";
import { useT } from "@/components/i18n/LocaleProvider";
import { Reveal } from "@/components/ui/Reveal";
import Section from "./Section";

type Step = {
  icon: LucideIcon;
  title: string;
  body: string;
  meta: string;
};

const STEP_ICONS: LucideIcon[] = [
  MessagesSquare,
  CheckCircle2,
  Hammer,
  PartyPopper,
];

export default function Process() {
  const t = useT();
  const steps: Step[] = t.process.steps.map((s, i) => ({
    ...s,
    icon: STEP_ICONS[i] ?? MessagesSquare,
  }));

  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 60%"],
  });
  // Spring so the line glides rather than tracking the wheel 1:1.
  const lineHeight = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });
  const scaleY = useTransform(lineHeight, [0, 1], [0, 1]);

  return (
    <Section
      id="process"
      eyebrow={t.process.eyebrow}
      title={t.process.title}
      accent={t.process.accent}
      lead={t.process.lead}
    >
      <div ref={ref} className="relative mx-auto max-w-3xl">
        {/* Rail */}
        <div className="absolute left-[27px] top-2 hidden h-[calc(100%-2rem)] w-px bg-white/8 sm:block">
          <motion.div
            style={{ scaleY, transformOrigin: "top" }}
            className="h-full w-full bg-gradient-to-b from-prism-cyan via-prism-violet to-prism-pink"
          />
        </div>

        <ol className="space-y-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title}>
                <Reveal delay={i * 0.06} direction="up">
                  <div className="group relative flex gap-4 sm:gap-6">
                    <div className="relative z-10 hidden shrink-0 sm:block">
                      <div className="grid size-14 place-items-center rounded-2xl border border-white/12 bg-ink-900/90 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.16)] backdrop-blur-xl transition-all duration-500 group-hover:border-white/30 group-hover:shadow-[0_0_0_5px_rgba(94,231,255,.08),inset_0_1px_0_rgba(255,255,255,.22)]">
                        <Icon className="size-5" strokeWidth={1.5} />
                      </div>
                    </div>

                    <div className="glass glass-rim spotlight flex-1 rounded-2xl p-5 transition-colors duration-500 hover:border-white/20 sm:p-6">
                      {/* Number and title stay together, so a narrow card drops
                          the duration chip onto its own line every time. Left
                          loose to wrap, `ml-auto` stranded it on the right for
                          long titles and inlined it for short ones. */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1.5">
                        <div className="flex items-baseline gap-3">
                          <span className="font-mono text-[11px] text-prism-cyan">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <h3 className="text-[17px] font-medium tracking-tight text-white">
                            {step.title}
                          </h3>
                        </div>
                        <span className="self-start rounded-full border border-white/8 bg-white/[.04] px-2.5 py-1 text-[11px] text-haze-300 sm:ml-auto sm:self-auto">
                          {step.meta}
                        </span>
                      </div>
                      <p className="mt-2.5 text-[14px] leading-relaxed text-haze-300">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
