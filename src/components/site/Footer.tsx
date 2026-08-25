"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/LocaleProvider";
import Logo from "./Logo";

const YEAR = new Date().getFullYear();

export default function Footer() {
  const t = useT();

  const nav = [
    { href: "#services", label: t.nav.services },
    { href: "#work", label: t.nav.work },
    { href: "#styles", label: t.nav.styles },
    { href: "#process", label: t.nav.process },
    { href: "#faq", label: t.nav.faq },
  ];

  return (
    <footer className="relative mt-8 border-t border-white/8">
      <div className="mx-auto w-full max-w-6xl px-5 py-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-[13.5px] leading-relaxed text-haze-400">
              {t.footer.blurb}
            </p>
          </div>

          <nav aria-label={t.footer.explore} className="flex flex-col gap-2.5">
            <span className="text-[11px] uppercase tracking-[0.18em] text-haze-400">
              {t.footer.explore}
            </span>
            {nav.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[13.5px] text-haze-200 transition hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col-reverse items-center gap-4 border-t border-white/8 pt-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-haze-400">
            © {YEAR} IT-Network. {t.footer.rights}
          </p>
          <Link
            href="/admin"
            className="text-xs text-haze-400 transition hover:text-haze-200"
          >
            {t.footer.admin}
          </Link>
        </div>
      </div>
    </footer>
  );
}
