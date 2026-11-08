import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export type Tone = "light" | "dark";

/**
 * Shared section shell: rhythm, heading treatment and max width.
 *
 * `tone` picks the chapter: light sections sit on opaque paper and hide the 3D
 * layer; dark ones are transparent so the aurora shows through, and are what
 * wakes the 3D layer up (see Background3D, which looks for `data-tone`).
 */
export default function Section({
  id,
  eyebrow,
  title,
  accent,
  lead,
  children,
  tone = "light",
  align = "left",
  className = "",
}: {
  id?: string;
  eyebrow: string;
  title: string;
  /** Rendered in the display serif, after the title. */
  accent?: string;
  lead?: string;
  children: ReactNode;
  tone?: Tone;
  align?: "center" | "left";
  className?: string;
}) {
  const centered = align === "center";
  const light = tone === "light";

  return (
    <section
      id={id}
      data-tone={tone}
      className={`relative w-full scroll-mt-24 ${light ? "bg-paper text-ink" : ""} ${className}`}
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:py-36">
        <div className={centered ? "text-center" : ""}>
          <Reveal>
            <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
          </Reveal>

          <Reveal delay={0.06}>
            <h2
              className={`mt-6 max-w-4xl text-balance text-[clamp(1.9rem,4.8vw,3.9rem)] font-semibold leading-[0.98] tracking-[-0.045em] ${
                centered ? "mx-auto" : ""
              } ${light ? "text-ink" : "text-white"}`}
            >
              {/* The separating space belongs to the sans face, not the display
                  serif — the serif's space is narrow enough at headline size
                  that two words read as one. */}
              {title}{" "}
              {accent && (
                <span
                  className={`display font-normal tracking-[-0.02em] ${
                    light ? "text-signal" : "text-prism-a"
                  }`}
                >
                  {accent}
                </span>
              )}
            </h2>
          </Reveal>

          {lead && (
            <Reveal delay={0.12}>
              <p
                className={`mt-6 max-w-2xl text-balance text-[16px] leading-relaxed sm:text-[18px] ${
                  centered ? "mx-auto" : ""
                } ${light ? "text-ink-2" : "text-haze-300"}`}
              >
                {lead}
              </p>
            </Reveal>
          )}
        </div>

        <div className="mt-14 sm:mt-20">{children}</div>
      </div>
    </section>
  );
}
