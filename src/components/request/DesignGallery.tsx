"use client";

import { motion } from "motion/react";
import { Check, Shuffle } from "lucide-react";
import { DESIGN_STYLES } from "@/lib/catalog";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { styleCopy } from "@/lib/i18n/styles";
import StylePreview from "./StylePreview";

/**
 * The visual-direction picker. Each tile is a live CSS mock of the style, so
 * the client chooses by looking rather than by parsing adjectives.
 */
export default function DesignGallery({
  selected,
  onSelect,
  disabled,
}: {
  selected?: string;
  onSelect: (styleId: string, label: string) => void;
  disabled?: boolean;
}) {
  const { locale, t } = useLocale();

  return (
    <div className="mt-3">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {DESIGN_STYLES.map((style, i) => {
          const active = selected === style.id;
          const copy = styleCopy(locale, style.id);
          const label = copy?.label ?? style.label;
          return (
            <motion.button
              key={style.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(style.id, label)}
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.45,
                delay: i * 0.035,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`group relative overflow-hidden rounded-xl border text-left transition-all duration-300 disabled:cursor-not-allowed ${
                active
                  ? "border-prism-cyan/70 shadow-[0_0_0_1px_var(--color-prism-cyan),0_10px_30px_-12px_rgba(94,231,255,.6)]"
                  : "border-white/10 hover:-translate-y-0.5 hover:border-white/30"
              }`}
            >
              <StylePreview style={style} className="h-[92px]" />

              {active && (
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-prism-cyan text-ink-950 shadow-lg"
                >
                  <Check className="size-3" strokeWidth={3} />
                </motion.span>
              )}

              <div className="border-t border-white/8 bg-ink-900/80 px-2.5 py-2 backdrop-blur-sm">
                <div className="text-[12px] font-medium leading-tight text-white">
                  {label}
                </div>
                <div className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug text-haze-400">
                  {copy?.description ?? style.description}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect("", t.design.notSureEcho)}
        className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-xs text-haze-300 transition hover:border-white/25 hover:text-white disabled:opacity-50"
      >
        <Shuffle className="size-3.5" />
        {t.design.notSure}
      </button>
    </div>
  );
}
