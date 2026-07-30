"use client";

import { motion } from "motion/react";
import { ArrowRight, Blocks, Globe, Lock, Send, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PROJECT_KINDS, type ProjectKind } from "@/lib/catalog";
import { useT } from "@/components/i18n/LocaleProvider";

const ICONS: Record<ProjectKind, LucideIcon> = {
  website: Globe,
  telegram_bot: Send,
  other: Blocks,
  mobile_app: Smartphone,
};

const GLOW: Record<ProjectKind, string> = {
  website: "from-prism-cyan/25",
  telegram_bot: "from-sky-400/25",
  other: "from-prism-violet/25",
  mobile_app: "from-white/10",
};

export default function KindPicker({
  onPick,
}: {
  onPick: (kind: ProjectKind) => void;
}) {
  const t = useT();

  return (
    <div className="p-6 pt-9 sm:p-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-balance text-2xl font-medium tracking-tight text-white sm:text-3xl">
          {t.kinds.heading}
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-haze-300">
          {t.kinds.lead}
        </p>
      </motion.div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {PROJECT_KINDS.map((k, i) => {
          const Icon = ICONS[k.id];
          const disabled = !k.available;
          const copy = t.kinds[k.id];

          return (
            <motion.button
              key={k.id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onPick(k.id)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.06 * i, ease: [0.16, 1, 0.3, 1] }}
              aria-disabled={disabled}
              className={`group glass glass-rim spotlight relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-500 ${
                disabled
                  ? "cursor-not-allowed opacity-55"
                  : "hover:-translate-y-1 hover:border-white/25"
              }`}
            >
              {/* Colour wash that blooms up from the bottom on hover. */}
              <span
                className={`pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t ${GLOW[k.id]} to-transparent opacity-0 transition-opacity duration-500 ${
                  disabled ? "" : "group-hover:opacity-100"
                }`}
              />

              {/* Only the icon, name and tagline share a row. The blurb and the
                  example chips used to be indented into the same column, which
                  on a phone left them about 180px wide — four-word lines and
                  chips wrapping one per row. */}
              <span className="relative block">
                <span className="flex items-start gap-3.5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/[.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.18)]">
                    <Icon className="size-5" strokeWidth={1.6} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium tracking-tight text-white">
                        {copy.label}
                      </span>
                      {disabled && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/25 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-200">
                          <Lock className="size-2.5" />
                          {t.kinds.soon}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-haze-300">
                      {copy.tagline}
                    </span>
                  </span>

                  {!disabled && (
                    <ArrowRight className="mt-3 size-4 shrink-0 translate-x-0 text-haze-400 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white group-hover:opacity-100" />
                  )}
                </span>

                <span className="mt-3 block text-xs leading-relaxed text-haze-400">
                  {copy.blurb}
                </span>

                <span className="mt-3 flex flex-wrap gap-1.5">
                  {copy.examples.slice(0, 3).map((ex) => (
                    <span
                      key={ex}
                      className="rounded-full border border-white/8 bg-white/[.04] px-2 py-0.5 text-[10.5px] text-haze-300"
                    >
                      {ex}
                    </span>
                  ))}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-haze-400">{t.kinds.footnote}</p>
    </div>
  );
}
