import { useId, type SVGProps } from "react";

/**
 * The IT-Network mark: four nodes joined by three links, which trace an "N"
 * and a network graph at the same time.
 *
 * The links are white and the nodes carry the prism gradient, not the other way
 * around. White strokes are what keep the letterform readable once the mark is
 * down at 20px; the gradient then only has to do one job — make the four joints
 * read as separate nodes rather than corners of a glyph.
 */
export function LogoMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  // The mark renders twice per page (nav and footer). A fixed gradient id would
  // put a duplicate id in the document and make the second instance point at
  // the first one's def. Strip the punctuation React puts around the id so it
  // stays a plain word inside `url(#…)`.
  const gradientId = `itn-mark-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label="IT-Network"
      className={className}
      {...props}
    >
      <defs>
        {/* userSpaceOnUse, so one gradient runs across all four nodes instead
            of each circle repeating the full ramp and turning muddy. */}
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1="4"
          y1="3"
          x2="20"
          y2="21"
        >
          <stop offset="0" stopColor="var(--color-prism-a)" />
          <stop offset="0.5" stopColor="var(--color-prism-b)" />
          <stop offset="1" stopColor="var(--color-prism-c)" />
        </linearGradient>
      </defs>

      <g stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.92">
        <path d="M6.5 6V18" />
        <path d="M17.5 6V18" />
        <path d="M6.5 6L17.5 18" />
      </g>

      <g fill={`url(#${gradientId})`}>
        <circle cx="6.5" cy="6" r="2.9" />
        <circle cx="17.5" cy="6" r="2.9" />
        <circle cx="6.5" cy="18" r="2.9" />
        <circle cx="17.5" cy="18" r="2.9" />
      </g>
    </svg>
  );
}

/**
 * Mark plus wordmark. `spin` drives the conic ring's orbit animation — on in
 * the nav, off in the footer, where nothing else on the page is moving.
 */
export default function Logo({
  spin = false,
  tone = "dark",
}: {
  spin?: boolean;
  /** Colour of the wordmark: white on dark chapters, ink on light ones. */
  tone?: "dark" | "light";
}) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative grid size-10 place-items-center">
        <span
          className={`absolute inset-0 rounded-[12px] bg-[conic-gradient(from_0deg,var(--color-prism-a),var(--color-prism-b),var(--color-prism-c),var(--color-prism-a))] ${
            spin ? "animate-orbit opacity-90" : ""
          }`}
        />
        <span className="absolute inset-[1.5px] rounded-[10.5px] bg-ink-950" />
        <LogoMark className="relative size-6" />
      </span>
      <span
        className={`font-heading text-[17px] font-semibold tracking-[-0.03em] transition-colors duration-500 ${
          tone === "light" ? "text-ink" : "text-white"
        }`}
      >
        it-network<span className={tone === "light" ? "text-ink-3" : "text-haze-400"}>.uz</span>
      </span>
    </span>
  );
}
