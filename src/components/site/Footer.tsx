"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/LocaleProvider";

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
            <div className="flex items-center gap-2.5">
              <span className="relative grid size-8 place-items-center">
                <span className="absolute inset-0 rounded-[10px] bg-[conic-gradient(from_0deg,var(--color-prism-cyan),var(--color-prism-violet),var(--color-prism-pink),var(--color-prism-cyan))]" />
                <span className="absolute inset-[1.5px] rounded-[8.5px] bg-ink-950" />
                <span className="relative text-[13px] font-semibold text-white">M</span>
              </span>
              <span className="text-[15px] font-medium tracking-tight text-white">
                malikov<span className="text-haze-400">.dev</span>
              </span>
            </div>
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
            © {YEAR} Malikov. {t.footer.rights}
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
