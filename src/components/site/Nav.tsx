"use client";

import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "motion/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useT } from "@/components/i18n/LocaleProvider";
import RequestButton from "./RequestButton";

export default function Nav() {
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  const links = [
    { href: "#services", label: t.nav.services },
    { href: "#work", label: t.nav.work },
    { href: "#styles", label: t.nav.styles },
    { href: "#process", label: t.nav.process },
    { href: "#faq", label: t.nav.faq },
  ];

  // Condense into a glass pill once the hero starts leaving.
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  return (
    <>
      {/* No entrance delay. The header carries the primary call to action, and
          a slow drop-in meant it arrived after the reader had already started
          scrolling — so the button appeared to pop in out of nowhere. */}
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-5 sm:pt-4"
      >
        <nav
          className={`flex w-full max-w-6xl items-center gap-3 rounded-full transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
            scrolled
              ? "glass px-3 py-2 shadow-[0_18px_50px_-24px_rgba(0,0,0,1)] sm:px-4"
              : "border border-transparent px-3 py-2.5 sm:px-4"
          }`}
        >
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 pl-1"
            aria-label={t.nav.home}
          >
            <span className="relative grid size-8 place-items-center">
              {/* Prism mark: a rotating conic ring around a glass core. */}
              <span className="absolute inset-0 animate-orbit rounded-[10px] bg-[conic-gradient(from_0deg,var(--color-prism-cyan),var(--color-prism-violet),var(--color-prism-pink),var(--color-prism-cyan))] opacity-90" />
              <span className="absolute inset-[1.5px] rounded-[8.5px] bg-ink-950" />
              <span className="relative text-[13px] font-semibold tracking-tight text-white">
                M
              </span>
            </span>
            <span className="text-[15px] font-medium tracking-tight text-white">
              malikov
              <span className="text-haze-400">-dev</span>
            </span>
          </Link>

          <div className="mx-auto hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative rounded-full px-3.5 py-1.5 text-[13.5px] text-haze-200 transition hover:text-white"
              >
                <span className="relative z-10">{l.label}</span>
              </a>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <LanguageSwitcher />

            {/* Wrapper rather than `hidden sm:inline-flex` on the button:
                the button's own `inline-flex` is the same utility family as
                `hidden`, so the two would fight over which wins. */}
            <span className="hidden sm:block">
              <RequestButton size="sm">{t.nav.request}</RequestButton>
            </span>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={menuOpen}
              className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[.04] text-haze-200 transition hover:text-white md:hidden"
            >
              {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-ink-950/80 backdrop-blur-2xl md:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ y: -18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-1 px-6 pt-24"
            >
              {links.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i }}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-white/8 py-4 text-2xl font-medium tracking-tight text-white"
                >
                  {l.label}
                </motion.a>
              ))}
              <div className="pt-6">
                <RequestButton size="lg" className="w-full">
                  {t.nav.request}
                </RequestButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
