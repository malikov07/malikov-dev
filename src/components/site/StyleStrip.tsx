"use client";

import { DESIGN_STYLES } from "@/lib/catalog";
import StylePreview from "@/components/request/StylePreview";
import { useLocale, useT } from "@/components/i18n/LocaleProvider";
import { fill } from "@/lib/i18n";
import { styleCopy } from "@/lib/i18n/styles";
import { Reveal } from "@/components/ui/Reveal";
import Section from "./Section";
import { RequestTrigger } from "./RequestButton";

/** One infinite row. The list is rendered twice so the loop is seamless. */
function Row({
  reverse = false,
  duration = 46,
}: {
  reverse?: boolean;
  duration?: number;
}) {
  const { locale, t } = useLocale();
  const styles = reverse ? [...DESIGN_STYLES].reverse() : DESIGN_STYLES;

  return (
    <div className="marquee edge-fade hide-scrollbar relative snap-x snap-mandatory scroll-px-5 overflow-x-auto overflow-y-hidden py-2 sm:snap-none sm:overflow-hidden">
      <div
        className="marquee-track flex w-max gap-3 px-5 sm:px-0"
        style={
          {
            "--marquee-duration": `${duration}s`,
            animationDirection: reverse ? "reverse" : "normal",
          } as React.CSSProperties
        }
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            // The second copy exists only to make the desktop loop seamless.
            // Swiping by hand, it would just be ten duplicate cards to get past.
            className={copy === 1 ? "hidden gap-3 sm:flex" : "flex gap-3"}
            aria-hidden={copy === 1}
          >
            {styles.map((style) => {
              const label = styleCopy(locale, style.id)?.label ?? style.label;
              const description =
                styleCopy(locale, style.id)?.description ?? style.description;
              return (
                <RequestTrigger
                  key={`${copy}-${style.id}`}
                  kind="website"
                  aria-label={fill(t.styles.requestAria, { label })}
                  className="group w-[190px] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 text-left transition-all duration-500 sm:snap-align-none hover:-translate-y-1.5 hover:border-white/30 hover:shadow-[0_22px_50px_-22px_rgba(94,231,255,.55)]"
                >
                  <StylePreview style={style} className="h-[112px]" />
                  <div className="border-t border-white/8 bg-ink-900/70 px-3 py-2.5 backdrop-blur-sm">
                    <div className="text-[13px] font-medium text-white">{label}</div>
                    <div className="mt-0.5 line-clamp-1 text-[11px] text-haze-400">
                      {description}
                    </div>
                  </div>
                </RequestTrigger>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StyleStrip() {
  const t = useT();
  return (
    <Section
      id="styles"
      eyebrow={t.styles.eyebrow}
      title={t.styles.title}
      accent={t.styles.accent}
      lead={t.styles.lead}
    >
      <Reveal direction="blur">
        <div className="space-y-2">
          <Row duration={52} />
          <Row reverse duration={64} />
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        {/* Two strings rather than a media query in JS: the right one is chosen
            during paint, so it never renders the wrong gesture then swaps. */}
        <p className="mt-8 text-center text-xs text-haze-400">
          <span className="sm:hidden">{t.styles.noteTouch}</span>
          <span className="hidden sm:inline">{t.styles.note}</span>
        </p>
      </Reveal>
    </Section>
  );
}
