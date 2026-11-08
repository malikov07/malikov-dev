"use client";

import { useT } from "@/components/i18n/LocaleProvider";
import { Eyebrow } from "@/components/ui/Button";
import Magnetic from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import RequestButton from "./RequestButton";

/**
 * The closing chapter, back in the dark: the phone and browser return — built now
 * — above the last call to action, so the page ends on the object it opened
 * with. See `data-three-anchor` and Experience.tsx.
 */
export default function CtaBand() {
  const t = useT();

  return (
    <section data-tone="dark" className="relative">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col items-center justify-center px-5 py-24 text-center">
        <div
          data-three-anchor="cta"
          data-three-scale="0.92"
          aria-hidden
          className="pointer-events-none h-[30svh] min-h-[180px] w-full max-w-sm sm:h-[36svh]"
        />

        <Reveal>
          <Eyebrow className="mt-6">{t.cta.eyebrow}</Eyebrow>
        </Reveal>

        <Reveal delay={0.06}>
          <h2 className="mt-7 text-balance text-[clamp(2.1rem,6.4vw,5.6rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-white">
            {t.cta.titleA}
            <br />
            <span className="display font-normal tracking-[-0.02em] text-prism-a">{t.cta.titleB}</span>
          </h2>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mx-auto mt-7 max-w-lg text-balance text-[16px] leading-relaxed text-haze-300 sm:text-[18px]">
            {t.cta.lead}
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-10 flex justify-center">
            <Magnetic strength={0.3}>
              <RequestButton size="lg" className="px-9">
                {t.cta.button}
                <span className="ml-1 text-ink-950/40">→</span>
              </RequestButton>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
