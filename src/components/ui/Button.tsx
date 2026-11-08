"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "prism" | "ink" | "glass" | "ghost";
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px] gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-14 px-7 text-[15px] gap-2.5",
};

const BASE =
  "relative inline-flex items-center justify-center rounded-full font-medium " +
  "tracking-tight whitespace-nowrap transition-[transform,box-shadow,background,opacity] " +
  "duration-300 ease-[cubic-bezier(.16,1,.3,1)] active:scale-[.97] " +
  "disabled:pointer-events-none disabled:opacity-40 select-none";

const VARIANTS: Record<Variant, string> = {
  // Solid light pill — the single highest-priority action on any screen.
  prism:
    "bg-white text-ink-950 shadow-[0_10px_34px_-10px_rgba(108,242,200,.7)] " +
    "hover:shadow-[0_16px_46px_-10px_rgba(95,139,255,.85)] hover:-translate-y-0.5",
  // The same role on a light chapter: a solid ink pill.
  ink:
    "bg-ink text-white shadow-[0_12px_30px_-14px_rgba(11,12,15,.55)] " +
    "hover:bg-signal hover:shadow-[0_18px_40px_-14px_rgba(42,92,255,.6)] hover:-translate-y-0.5",
  glass:
    "glass sheen text-haze-100 hover:border-white/25 hover:-translate-y-0.5 " +
    "hover:shadow-[0_18px_48px_-18px_rgba(108,242,200,.5)]",
  ghost:
    "text-haze-200 hover:text-white hover:bg-white/[.06] border border-transparent hover:border-white/10",
};

type Props = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

export function Button({
  variant = "prism",
  size = "md",
  children,
  className = "",
  ...rest
}: Props & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className={`${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "prism",
  size = "md",
  children,
  className = "",
  href,
  ...rest
}: Props & ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      href={href}
      className={`${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

/** Small label used above section headings. */
export function Eyebrow({
  children,
  className = "",
  tone = "dark",
}: {
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light";
}) {
  if (tone === "light") {
    return (
      <span
        className={
          "inline-flex items-center gap-2 text-[12px] font-medium uppercase " +
          `tracking-[0.2em] text-ink-3 ${className}`
        }
      >
        <span className="size-1.5 rounded-full bg-signal" />
        {children}
      </span>
    );
  }
  return (
    <span
      className={
        "inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[.04] px-3.5 py-1.5 text-[11px] " +
        `font-medium uppercase tracking-[0.18em] text-haze-200 backdrop-blur-md ${className}`
      }
    >
      <span className="size-1.5 animate-breathe rounded-full bg-prism-a shadow-[0_0_10px_var(--color-prism-a)]" />
      {children}
    </span>
  );
}
