"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LOCALES, LOCALE_META, type Locale } from "@/lib/i18n/config";
import { useLocale } from "./LocaleProvider";

export default function LanguageSwitcher({
  className = "",
}: {
  className?: string;
}) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (next: Locale) => {
    setOpen(false);
    if (next === locale) return;

    // Remember the choice so the proxy sends them straight here next time.
    document.cookie = `md_locale=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;

    // Swap the leading locale segment, keeping whatever follows it.
    const rest = pathname.replace(/^\/[^/]+/, "");
    router.push(`/${next}${rest}`);
    router.refresh();
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.nav.language}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex h-9 items-center gap-1.5 rounded-full border border-white/12 bg-white/[.06] px-3 text-[12.5px] font-medium text-haze-200 transition hover:border-white/30 hover:text-white"
      >
        <Globe className="size-3.5" />
        {LOCALE_META[locale].short}
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-2xl p-1.5"
          >
            {LOCALES.map((l) => {
              const active = l === locale;
              return (
                <li key={l}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => choose(l)}
                    lang={LOCALE_META[l].htmlLang}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13.5px] transition ${
                      active
                        ? "bg-white/[.10] text-white"
                        : "text-haze-200 hover:bg-white/[.07] hover:text-white"
                    }`}
                  >
                    <span className="w-6 font-mono text-[11px] text-haze-400">
                      {LOCALE_META[l].short}
                    </span>
                    <span className="flex-1">{LOCALE_META[l].label}</span>
                    {active && <Check className="size-3.5 text-prism-cyan" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
