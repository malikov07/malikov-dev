"use client";

import type { DesignStyle } from "@/lib/catalog";

/**
 * A miniature "website" rendered entirely from the style's own tokens — a
 * page background, a floating card, a heading bar, two text bars and a button.
 *
 * Doing it in CSS rather than with screenshots means the previews stay crisp
 * at any size, weigh nothing, and can't go stale when a style is retuned.
 */
export default function StylePreview({
  style,
  className = "",
}: {
  style: DesignStyle;
  className?: string;
}) {
  const p = style.preview;

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ background: p.bg }}
      aria-hidden
    >
      {/* Browser chrome dots, to read instantly as "a website". */}
      <div className="absolute left-2 top-2 flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-[3px] rounded-full"
            style={{ background: p.text, opacity: 0.65 }}
          />
        ))}
      </div>

      <div className="flex h-full items-center justify-center p-3 pt-5">
        <div
          className="w-full max-w-[132px] p-2.5"
          style={{
            background: p.card,
            border: p.border,
            boxShadow: p.shadow,
            borderRadius: p.radius,
            backdropFilter: p.blur,
            WebkitBackdropFilter: p.blur,
          }}
        >
          {/* Headline */}
          <div
            className="mb-1.5 h-[5px] w-[68%] rounded-full"
            style={{ background: p.accent }}
          />
          {/* Body copy */}
          <div
            className="mb-1 h-[3px] w-full rounded-full"
            style={{ background: p.text }}
          />
          <div
            className="mb-2.5 h-[3px] w-[74%] rounded-full"
            style={{ background: p.text }}
          />
          {/* Button */}
          <div
            className="h-[9px] w-[46%]"
            style={{
              background: p.accent,
              borderRadius: Math.max(2, p.radius / 2),
            }}
          />
        </div>
      </div>
    </div>
  );
}
