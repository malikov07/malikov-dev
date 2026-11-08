"use client";

import {
  AnimatePresence,
  motion,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useT } from "@/components/i18n/LocaleProvider";
import Logo from "./Logo";
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

  // Which chapter is under the bar: it turns ink-on-paper over the light
  // sections and stays white-on-dark over the 3D ones.
  const [tone, setTone] = useState<"dark" | "light">("dark");
  const readTone = () => {
    const probeY = 36;
    for (const el of document.elementsFromPoint(window.innerWidth / 2, probeY)) {
      if (el.closest("header")) continue;
      const host = el.closest<HTMLElement>("[data-tone]");
      if (host) {
        setTone(host.dataset.tone === "light" ? "light" : "dark");
        return;
      }
    }
  };

  // Condense into a pill once the page starts moving. The tone is read on the
  // next frame too: a jump (an anchor link, a restored scroll position) can fire
  // its scroll event before the new layout is in place.
  useMotionValueEvent(scrollY, "change", (v) => {
    setScrolled(v > 40);
    readTone();
    requestAnimationFrame(readTone);
  });
  useEffect(() => {
    readTone();
    setScrolled(window.scrollY > 40);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const light = tone === "light";

  return (
    <>
      {/* No entrance delay. The header carries the primary call to action, and
          a slow drop-in meant it arrived after the reader had already started
          scrolling — so the button appeared to pop in out of nowhere. */}
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-5 sm:pt-5"
      >
        <nav
          className={`flex w-full max-w-[76rem] items-center gap-3 rounded-full border transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
            !scrolled
              ? "border-transparent px-3 py-3 sm:px-5"
              : light
                ? "border-ink/8 bg-paper/75 px-3 py-2 shadow-[0_18px_40px_-26px_rgba(11,12,15,.45)] backdrop-blur-xl backdrop-saturate-150 sm:px-5 sm:py-2.5"
                : "border-white/12 bg-ink-950/45 px-3 py-2 shadow-[0_18px_50px_-24px_rgba(0,0,0,1)] backdrop-blur-xl backdrop-saturate-150 sm:px-5 sm:py-2.5"
          }`}
        >
          <Link
            href="/"
            className="flex shrink-0 items-center pl-1"
            aria-label={t.nav.home}
          >
            <Logo spin tone={tone} />
          </Link>

          <div className="mx-auto hidden items-center gap-0.5 xl:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`relative rounded-full px-3.5 py-2 text-[15px] font-semibold tracking-[-0.01em] transition-colors duration-500 ${
                  light
                    ? "text-ink-2 hover:bg-ink/[.05] hover:text-ink"
                    : "text-haze-100 hover:bg-white/[.08] hover:text-white"
                }`}
              >
                <span className="relative z-10">{l.label}</span>
              </a>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2.5 xl:ml-0">
            <LanguageSwitcher tone={tone} />

            {/* Wrapper rather than `hidden sm:inline-flex` on the button:
                the button's own `inline-flex` is the same utility family as
                `hidden`, so the two would fight over which wins. */}
            <span className="hidden sm:block">
              <RequestButton
                size="md"
                variant={light ? "ink" : "prism"}
                className="h-12 px-6 text-[15px] font-semibold"
              >
                {t.nav.request}
              </RequestButton>
            </span>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={menuOpen}
              className={`grid size-12 place-items-center rounded-full border transition xl:hidden ${
                light
                  ? "border-ink/12 bg-ink/[.04] text-ink-2 hover:text-ink"
                  : "border-white/10 bg-white/[.04] text-haze-200 hover:text-white"
              }`}
            >
              {menuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
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
            className="fixed inset-0 z-40 bg-ink-950/80 backdrop-blur-2xl xl:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ y: -18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-1 px-6 pt-28"
            >
              {links.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i }}
                  onClick={() => setMenuOpen(false)}
                  className="font-heading border-b border-white/8 py-4 text-2xl font-semibold text-white"
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
