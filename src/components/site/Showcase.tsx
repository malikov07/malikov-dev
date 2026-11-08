"use client";

import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ProjectKind } from "@/lib/catalog";
import { useT } from "@/components/i18n/LocaleProvider";
import { fill } from "@/lib/i18n";
import { Eyebrow } from "@/components/ui/Button";
import Magnetic from "@/components/ui/Magnetic";
import RequestButton, { RequestTrigger } from "./RequestButton";
import {
  BookingScene,
  BotScene,
  DashboardScene,
  Fit,
  FlowScene,
  StoreScene,
  WebsiteScene,
} from "./Scenes";

type Item = {
  kind: ProjectKind;
  title: string;
  body: string;
  tags: string[];
  /** Flat tile colour, and whether the tile is dark (white copy on it). */
  tile: string;
  Scene: () => React.ReactElement;
};

/**
 * "What I build" as a horizontal gallery: the section pins, and scrolling down
 * slides a row of large project tiles sideways past the reader.
 *
 * The section's height is set from the row's measured width, so one pixel of
 * scroll moves the row one pixel — it never feels faster or slower than the
 * wheel.
 */
export default function Showcase() {
  const t = useT();
  const c = t.showcase.items;

  const items: Item[] = [
    { kind: "website", ...c.landing, tile: "bg-tile-blue", Scene: () => <WebsiteScene accent="#0b0c0f" /> },
    { kind: "telegram_bot", ...c.shopBot, tile: "bg-tile-sky", Scene: BotScene },
    { kind: "website", ...c.store, tile: "bg-tile-coral", Scene: StoreScene },
    { kind: "website", ...c.booking, tile: "bg-tile-mint", Scene: BookingScene },
    { kind: "website", ...c.dashboard, tile: "bg-tile-graphite", Scene: DashboardScene },
    { kind: "other", ...c.automation, tile: "bg-tile-sun", Scene: FlowScene },
  ];

  const section = useRef<HTMLElement | null>(null);
  const viewport = useRef<HTMLDivElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);
  const distance = useMotionValue(0);
  const [height, setHeight] = useState<string>("400vh");

  useEffect(() => {
    const measure = () => {
      if (!track.current || !viewport.current) return;
      const d = Math.max(0, track.current.scrollWidth - viewport.current.clientWidth);
      distance.set(d);
      setHeight(`calc(${d}px + 100svh)`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    if (viewport.current) ro.observe(viewport.current);
    return () => ro.disconnect();
  }, [distance]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(() => -scrollYProgress.get() * distance.get());

  return (
    <section
      ref={section}
      id="work"
      data-tone="light"
      className="relative scroll-mt-0 bg-paper text-ink"
      style={{ height }}
    >
      <div ref={viewport} className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <motion.div ref={track} style={{ x }} className="flex w-max items-stretch gap-5 px-5 sm:gap-6 lg:px-[max(1.25rem,calc((100vw-72rem)/2+1.25rem))]">
          {/* Heading panel — the first thing in the row. */}
          <div className="flex w-[82vw] shrink-0 flex-col justify-center pr-6 sm:w-[46vw] lg:w-[34rem]">
            <Eyebrow tone="light">{t.showcase.eyebrow}</Eyebrow>
            <h2 className="mt-6 text-balance text-[clamp(1.9rem,4.4vw,3.6rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
              {t.showcase.title}{" "}
              <span className="display font-normal tracking-[-0.02em] text-signal">{t.showcase.accent}</span>
            </h2>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-ink-2 sm:text-[17px]">
              {t.showcase.lead}
            </p>
          </div>

          {items.map((item, i) => (
            <RequestTrigger
              key={item.title}
              kind={item.kind}
              aria-label={fill(t.showcase.requestAria, { title: item.title })}
              className="group flex h-[min(74svh,640px)] w-[84vw] shrink-0 flex-col text-left sm:w-[62vw] lg:w-[46rem]"
            >
              <div
                className={`relative min-h-0 flex-1 overflow-hidden rounded-[32px] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[.985] ${item.tile}`}
              >
                <Fit padding={0.84}>
                  <item.Scene />
                </Fit>
                <span className="absolute left-6 top-5 font-mono text-[12px] text-white/70">
                  0{i + 1} / 0{items.length}
                </span>
              </div>
              <div className="flex items-start justify-between gap-6 pt-6">
                <div>
                  <h3 className="text-[clamp(1.2rem,1.8vw,1.6rem)] font-semibold leading-tight tracking-[-0.03em]">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink-2">{item.body}</p>
                </div>
                <span className="grid size-12 shrink-0 place-items-center rounded-full border border-ink/15 transition-all duration-500 group-hover:rotate-45 group-hover:border-ink group-hover:bg-ink group-hover:text-white">
                  <ArrowUpRight className="size-5" />
                </span>
              </div>
            </RequestTrigger>
          ))}

          {/* The last panel: the section's own call to action. */}
          <div className="flex h-[min(74svh,640px)] w-[84vw] shrink-0 flex-col justify-between rounded-[32px] bg-ink p-8 text-white sm:w-[46vw] sm:p-10 lg:w-[30rem]">
            <span className="font-mono text-[12px] text-white/50">+</span>
            <div>
              <h3 className="text-balance text-[clamp(1.6rem,2.4vw,2.1rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
                {t.showcase.bandTitle}
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-white/65">{t.showcase.bandBody}</p>
              <div className="mt-8">
                <Magnetic strength={0.25}>
                  <RequestButton size="lg">
                    {t.nav.request}
                    <span className="ml-0.5 text-ink-950/40">→</span>
                  </RequestButton>
                </Magnetic>
              </div>
              <p className="mt-5 text-[12px] text-white/45">{t.showcase.bandNote}</p>
            </div>
          </div>
        </motion.div>

        {/* How far along the row you are. */}
        <div className="mx-auto mt-8 h-[2px] w-[min(72rem,calc(100vw-2.5rem))] overflow-hidden rounded-full bg-ink/10">
          <motion.div style={{ scaleX: scrollYProgress }} className="h-full origin-left bg-ink" />
        </div>
      </div>
    </section>
  );
}
