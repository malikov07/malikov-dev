import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

/** Shared section shell: consistent rhythm, heading treatment and max width. */
export default function Section({
  id,
  eyebrow,
  title,
  accent,
  lead,
  children,
  align = "center",
  className = "",
}: {
  id?: string;
  eyebrow: string;
  title: string;
  /** Rendered in the display serif, after the title. */
  accent?: string;
  lead?: string;
  children: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  const centered = align === "center";

  return (
    <section
      id={id}
      className={`relative mx-auto w-full max-w-6xl scroll-mt-28 px-5 py-24 sm:py-32 ${className}`}
    >
      <div className={centered ? "text-center" : ""}>
        <Reveal direction="scale">
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>

        <Reveal delay={0.08}>
          {/* The gradient sits on inline spans, not on the h2. On a block it
              would need vertical padding to keep its descenders, and that
              padding would show up as real height. */}
          <h2 className="mt-5 text-balance text-[clamp(2rem,4.6vw,3.35rem)] font-medium leading-[1.03] tracking-[-0.03em]">
            {/* The separating space belongs to the sans face, not the display
                serif — the serif's space is narrow enough at headline size that
                "tanlang. Dizayn" read as one run-together word. */}
            <span className="text-fade">{title}</span>{" "}
            {accent && <span className="display text-prism">{accent}</span>}
          </h2>
        </Reveal>

        {lead && (
          <Reveal delay={0.14}>
            <p
              className={`mt-5 max-w-2xl text-balance text-[15px] leading-relaxed text-haze-300 ${
                centered ? "mx-auto" : ""
              }`}
            >
              {lead}
            </p>
          </Reveal>
        )}
      </div>

      <div className="mt-14">{children}</div>
    </section>
  );
}
