"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ProjectKind } from "@/lib/catalog";
import { useT } from "@/components/i18n/LocaleProvider";
import Section from "./Section";
import { RequestTrigger } from "./RequestButton";
import { BotScene, Fit, FlowScene, WebsiteScene } from "./Scenes";

type Service = {
  kind: ProjectKind;
  title: string;
  body: string;
  points: string[];
  tile: string;
  Scene: () => React.ReactElement;
};

/**
 * The three kinds of work as a sticky showcase: on a desktop the text scrolls
 * past on the left while one coloured tile stays pinned on the right and
 * changes scene to match whichever service is in the middle of the screen.
 * On a phone each service simply carries its own tile.
 */
export default function Services() {
  const t = useT();
  const services: Service[] = [
    { kind: "website", ...t.services.website, tile: "bg-tile-blue", Scene: () => <WebsiteScene /> },
    { kind: "telegram_bot", ...t.services.bot, tile: "bg-tile-sky", Scene: BotScene },
    { kind: "other", ...t.services.other, tile: "bg-tile-sun", Scene: FlowScene },
  ];

  const [active, setActive] = useState(0);
  const blocks = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Whichever block crosses the middle band of the screen is the active one.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    blocks.current.forEach((b) => b && io.observe(b));
    return () => io.disconnect();
  }, []);

  const current = services[active];

  return (
    <Section
      id="services"
      eyebrow={t.services.eyebrow}
      title={t.services.title}
      accent={t.services.accent}
      lead={t.services.lead}
    >
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          {services.map((s, i) => (
            <div
              key={s.kind}
              ref={(el) => {
                blocks.current[i] = el;
              }}
              data-index={i}
              className={`py-10 transition-opacity duration-500 lg:flex lg:min-h-[78vh] lg:flex-col lg:justify-center lg:py-0 ${
                active === i ? "lg:opacity-100" : "lg:opacity-25"
              }`}
            >
              <div className={`mb-8 aspect-[4/3] overflow-hidden rounded-[28px] lg:hidden ${s.tile}`}>
                <Fit>
                  <s.Scene />
                </Fit>
              </div>

              <span className="font-mono text-[13px] text-ink-3">0{i + 1}</span>
              <h3 className="mt-3 text-[clamp(1.7rem,3.2vw,2.6rem)] font-semibold leading-none tracking-[-0.04em]">
                {s.title}
              </h3>
              <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink-2">{s.body}</p>
              <ul className="mt-7 space-y-3">
                {s.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-[15px] text-ink">
                    <span className="grid size-5 place-items-center rounded-full bg-ink text-white">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <RequestTrigger
                kind={s.kind}
                aria-label={`${t.services.start} — ${s.title}`}
                className="group mt-9 inline-flex items-center gap-2 text-[15px] font-semibold text-signal"
              >
                {t.services.start}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </RequestTrigger>
            </div>
          ))}
        </div>

        {/* The pinned tile. */}
        <div className="hidden lg:block">
          <div className="sticky top-[13vh] h-[74vh]">
            <motion.div
              className={`relative h-full overflow-hidden rounded-[36px] transition-colors duration-700 ${current.tile}`}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 60, scale: 0.94, rotateX: 12 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                  exit={{ opacity: 0, y: -60, scale: 0.96, rotateX: -10 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                  style={{ transformPerspective: 1200 }}
                >
                  <Fit padding={0.86}>
                    <current.Scene />
                  </Fit>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}
