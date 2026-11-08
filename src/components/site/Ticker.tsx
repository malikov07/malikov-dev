"use client";

import type { CSSProperties } from "react";
import { useT } from "@/components/i18n/LocaleProvider";

/** One band. The word list is rendered twice so the loop has no seam. */
function Band({
  words,
  reverse = false,
  duration,
  className = "",
  dark = true,
}: {
  words: string[];
  reverse?: boolean;
  /** White type for the ink band; ink type for the faint band on paper. */
  dark?: boolean;
  duration: number;
  className?: string;
}) {
  return (
    <div className={`flex overflow-hidden ${className}`}>
      <div
        className="ticker-track flex w-max shrink-0 items-center"
        style={
          {
            "--ticker-duration": `${duration}s`,
            animationDirection: reverse ? "reverse" : "normal",
          } as CSSProperties
        }
      >
        {[0, 1].map((copy) =>
          words.map((w, i) => (
            <span key={`${copy}-${i}`} className="flex items-center">
              <span
                className={`whitespace-nowrap font-heading px-5 text-[clamp(1.7rem,4.4vw,3.6rem)] font-semibold leading-none tracking-[-0.045em] sm:px-8 ${
                  i % 2 ? (dark ? "text-outline" : "text-outline-ink") : dark ? "text-white" : "text-ink"
                }`}
              >
                {w}
              </span>
              <Spark />
            </span>
          )),
        )}
      </div>
    </div>
  );
}

function Spark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0 sm:size-7" aria-hidden>
      <path
        d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z"
        fill="url(#ticker-spark)"
      />
    </svg>
  );
}

/**
 * Two crossing bands of the kinds of work: a solid ink band over a faint
 * outlined one turning the other way. Sits on paper between two light chapters.
 * Pure decoration — the same list is said properly in the sections below —
 * so it is hidden from assistive tech.
 */
export default function Ticker() {
  const t = useT();
  const words = t.ticker;

  return (
    <div aria-hidden data-tone="light" className="relative isolate overflow-hidden bg-paper py-16 sm:py-24">
      {/* Defined once; every spark on both bands points at it. */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="ticker-spark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--color-prism-a)" />
            <stop offset=".55" stopColor="var(--color-prism-b)" />
            <stop offset="1" stopColor="var(--color-prism-c)" />
          </linearGradient>
        </defs>
      </svg>
      {/* The faint band behind, turning the other way. */}
      <Band
        words={[...words].reverse()}
        reverse
        dark={false}
        duration={70}
        className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 rotate-[3deg] opacity-60"
      />
      <div className="relative -mx-[5%] rotate-[-2.5deg] bg-ink py-5 shadow-[0_40px_80px_-40px_rgba(11,12,15,.6)] sm:py-7">
        <Band words={words} duration={46} />
      </div>
    </div>
  );
}
