"use client";

import { ArrowUpRight } from "lucide-react";
import type { ProjectKind } from "@/lib/catalog";
import { useT } from "@/components/i18n/LocaleProvider";
import { fill } from "@/lib/i18n";
import Magnetic from "@/components/ui/Magnetic";
import TiltCard from "@/components/ui/TiltCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import Section from "./Section";
import RequestButton, { RequestTrigger } from "./RequestButton";
import {
  AutomationMock,
  BookingMock,
  BotChatMock,
  DashboardMock,
  LandingMock,
  StoreMock,
} from "./Mocks";

type Item = {
  kind: ProjectKind;
  title: string;
  body: string;
  tags: string[];
  mock: () => React.ReactElement;
  /** Wide cards break the grid rhythm so it reads as a bento, not a table. */
  wide?: boolean;
};

export default function Showcase() {
  const t = useT();
  const c = t.showcase.items;

  const items: Item[] = [
    { kind: "website", ...c.landing, mock: LandingMock, wide: true },
    { kind: "telegram_bot", ...c.shopBot, mock: BotChatMock },
    { kind: "website", ...c.store, mock: StoreMock },
    { kind: "website", ...c.booking, mock: BookingMock },
    { kind: "website", ...c.dashboard, mock: DashboardMock },
    { kind: "other", ...c.automation, mock: AutomationMock, wide: true },
  ];

  return (
    <Section
      id="work"
      eyebrow={t.showcase.eyebrow}
      title={t.showcase.title}
      accent={t.showcase.accent}
      lead={t.showcase.lead}
    >
      <RevealGroup
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        stagger={0.07}
      >
        {items.map((item) => {
          const Mock = item.mock;
          return (
            <RevealItem
              key={item.title}
              className={item.wide ? "sm:col-span-2 lg:col-span-2" : ""}
            >
              <TiltCard intensity={5} className="h-full">
                <RequestTrigger
                  kind={item.kind}
                  aria-label={fill(t.showcase.requestAria, { title: item.title })}
                  className="glass glass-rim spotlight sheen relative flex h-full w-full flex-col overflow-hidden rounded-3xl p-4 text-left transition-colors duration-500 hover:border-white/25 sm:p-5"
                >
                  <div
                    className={`relative ${item.wide ? "h-40" : "h-36"} shrink-0`}
                    style={{ transform: "translateZ(30px)" }}
                  >
                    <Mock />
                  </div>

                  <div className="relative mt-4 flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[17px] font-medium leading-snug tracking-tight text-white">
                        {item.title}
                      </h3>
                      <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-haze-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                    </div>

                    <p className="mt-2 text-[13.5px] leading-relaxed text-haze-300">
                      {item.body}
                    </p>

                    <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/8 bg-white/[.04] px-2.5 py-1 text-[11px] text-haze-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </RequestTrigger>
              </TiltCard>
            </RevealItem>
          );
        })}
      </RevealGroup>

      {/* The section's own call to action, for people who scrolled past the hero. */}
      <Reveal delay={0.1}>
        <div className="glass glass-rim relative mt-6 overflow-hidden rounded-3xl px-6 py-10 text-center sm:px-10">
          <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-[70%] rounded-full bg-prism-violet/25 blur-[90px]" />

          <h3 className="relative text-balance text-2xl font-medium tracking-tight text-white sm:text-3xl">
            {t.showcase.bandTitle}
          </h3>
          <p className="relative mx-auto mt-3 max-w-lg text-balance text-[14.5px] leading-relaxed text-haze-300">
            {t.showcase.bandBody}
          </p>

          <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
            <Magnetic strength={0.25}>
              <RequestButton size="lg">
                {t.nav.request}
                <span className="ml-0.5 text-ink-950/40">→</span>
              </RequestButton>
            </Magnetic>
          </div>

          <p className="relative mt-5 text-xs text-haze-400">
            {t.showcase.bandNote}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
