"use client";

import { Blocks, Globe, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ProjectKind } from "@/lib/catalog";
import { useT } from "@/components/i18n/LocaleProvider";
import TiltCard from "@/components/ui/TiltCard";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import Section from "./Section";
import { RequestTrigger } from "./RequestButton";

type Service = {
  kind: ProjectKind;
  icon: LucideIcon;
  title: string;
  body: string;
  points: string[];
  glow: string;
};

export default function Services() {
  const t = useT();

  const services: Service[] = [
    {
      kind: "website",
      icon: Globe,
      ...t.services.website,
      glow: "rgba(94,231,255,.30)",
    },
    {
      kind: "telegram_bot",
      icon: Send,
      ...t.services.bot,
      glow: "rgba(56,189,248,.30)",
    },
    {
      kind: "other",
      icon: Blocks,
      ...t.services.other,
      glow: "rgba(167,139,250,.30)",
    },
  ];

  return (
    <Section
      id="services"
      eyebrow={t.services.eyebrow}
      title={t.services.title}
      accent={t.services.accent}
      lead={t.services.lead}
    >
      <RevealGroup className="grid gap-4 md:grid-cols-3" stagger={0.1}>
        {services.map((s) => {
          const Icon = s.icon;
          return (
            <RevealItem key={s.kind}>
              <TiltCard intensity={7} className="h-full">
                <RequestTrigger
                  kind={s.kind}
                  aria-label={`${t.services.start} — ${s.title}`}
                  className="glass glass-rim spotlight relative flex h-full w-full flex-col overflow-hidden rounded-3xl p-6 text-left transition-colors duration-500 hover:border-white/25 sm:p-7"
                >
                  {/* Ambient bloom, tinted per service. */}
                  <span
                    className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                    style={{ background: s.glow }}
                  />

                  <span
                    className="relative grid size-12 place-items-center rounded-2xl border border-white/12 bg-white/[.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.2)]"
                    style={{ transform: "translateZ(38px)" }}
                  >
                    <Icon className="size-5.5" strokeWidth={1.5} />
                  </span>

                  <h3
                    className="relative mt-5 text-xl font-medium tracking-tight text-white"
                    style={{ transform: "translateZ(26px)" }}
                  >
                    {s.title}
                  </h3>

                  <p className="relative mt-2.5 text-[14px] leading-relaxed text-haze-300">
                    {s.body}
                  </p>

                  <ul className="relative mt-5 space-y-2 border-t border-white/8 pt-5">
                    {s.points.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-2.5 text-[13.5px] text-haze-200"
                      >
                        <span className="mt-[7px] size-1 shrink-0 rounded-full bg-gradient-to-r from-prism-cyan to-prism-violet" />
                        {p}
                      </li>
                    ))}
                  </ul>

                  <span className="relative mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-white">
                    {t.services.start}
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </RequestTrigger>
              </TiltCard>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </Section>
  );
}
