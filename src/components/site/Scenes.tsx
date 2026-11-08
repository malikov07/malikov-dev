"use client";

import { motion } from "motion/react";
import {
  Bell,
  Bot,
  Check,
  FileSpreadsheet,
  Mail,
  Search,
  ShoppingBag,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Product scenes for the coloured tiles: what each kind of project looks like,
 * drawn as clean white UI on a flat colour.
 *
 * Deliberately abstract — bars for text, blocks for images — so they show the
 * shape of the work without pretending to be a real client's product, and so
 * they never need translating. Each scene is drawn on a fixed 560×420 stage and
 * scaled to fit whatever tile holds it.
 */

const STAGE_W = 560;
const STAGE_H = 420;

export function Fit({ children, padding = 0.9 }: { children: ReactNode; padding?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.8);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.min(width / STAGE_W, height / STAGE_H) * padding);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [padding]);

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden" aria-hidden>
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
});

const Bar = ({ w, className = "bg-ink/10", h = 8 }: { w: string; className?: string; h?: number }) => (
  <div className={`rounded-full ${className}`} style={{ width: w, height: h }} />
);

function Dots() {
  return (
    <div className="flex gap-1.5">
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <span key={c} className="size-2.5 rounded-full" style={{ background: c }} />
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- Website */

export function WebsiteScene({ accent = "var(--color-tile-blue)" }: { accent?: string }) {
  return (
    <div className="relative h-full w-full">
      <motion.div
        {...rise()}
        className="absolute left-0 top-6 h-[340px] w-[470px] overflow-hidden rounded-2xl bg-white shadow-[0_40px_80px_-30px_rgba(0,0,0,.45)]"
      >
        <div className="flex items-center gap-3 border-b border-ink/6 px-4 py-3">
          <Dots />
          <div className="ml-3 flex h-6 flex-1 items-center gap-2 rounded-md bg-ink/[.05] px-2.5">
            <Search className="size-3 text-ink/30" />
            <Bar w="40%" h={6} />
          </div>
        </div>
        <div className="flex items-center justify-between px-6 pt-5">
          <div className="size-5 rounded-md" style={{ background: accent }} />
          <div className="flex gap-4">
            <Bar w="34px" h={6} />
            <Bar w="34px" h={6} />
            <Bar w="34px" h={6} />
          </div>
          <div className="h-6 w-16 rounded-full bg-ink" />
        </div>
        <div className="grid grid-cols-[1.1fr_1fr] gap-5 px-6 pt-8">
          <div className="space-y-2.5">
            <Bar w="92%" h={16} className="bg-ink" />
            <Bar w="70%" h={16} className="bg-ink" />
            <div className="pt-2" />
            <Bar w="100%" h={7} />
            <Bar w="84%" h={7} />
            <div className="flex gap-2 pt-4">
              <div className="h-8 w-24 rounded-full" style={{ background: accent }} />
              <div className="h-8 w-20 rounded-full border border-ink/15" />
            </div>
          </div>
          <div
            className="h-[150px] rounded-xl"
            style={{ background: `linear-gradient(140deg, ${accent}, #9ec2ff)` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3 px-6 pt-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-ink/[.04]" />
          ))}
        </div>
      </motion.div>

      {/* The same page on a phone — it has to work there too. */}
      <motion.div
        {...rise(0.15)}
        className="absolute bottom-0 right-2 h-[300px] w-[150px] overflow-hidden rounded-[28px] border-[5px] border-ink bg-white shadow-[0_40px_70px_-25px_rgba(0,0,0,.55)]"
      >
        <div className="mx-auto mt-1.5 h-3 w-12 rounded-full bg-ink" />
        <div className="space-y-2 px-3 pt-4">
          <Bar w="85%" h={10} className="bg-ink" />
          <Bar w="60%" h={10} className="bg-ink" />
          <Bar w="100%" h={5} />
          <Bar w="80%" h={5} />
          <div className="h-6 w-20 rounded-full" style={{ background: accent }} />
          <div
            className="mt-2 h-20 rounded-lg"
            style={{ background: `linear-gradient(140deg, ${accent}, #9ec2ff)` }}
          />
          <div className="h-10 rounded-lg bg-ink/[.05]" />
        </div>
      </motion.div>
    </div>
  );
}

/* ----------------------------------------------------------- Telegram bot */

export function BotScene() {
  const bubble = "rounded-2xl px-3 py-2.5";
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <motion.div
        {...rise()}
        className="relative h-[410px] w-[230px] overflow-hidden rounded-[34px] border-[6px] border-ink bg-[#e8eef4] shadow-[0_40px_80px_-30px_rgba(0,0,0,.5)]"
      >
        <div className="flex items-center gap-2.5 bg-white px-3.5 pb-2.5 pt-5">
          <div className="grid size-8 place-items-center rounded-full bg-tile-sky text-white">
            <Bot className="size-4" />
          </div>
          <div className="space-y-1.5">
            <Bar w="70px" h={7} className="bg-ink" />
            <Bar w="44px" h={5} className="bg-tile-sky/50" />
          </div>
        </div>

        <div className="space-y-2.5 p-3">
          <motion.div {...rise(0.2)} className={`${bubble} w-[78%] bg-white`}>
            <Bar w="90%" h={6} />
            <div className="h-1.5" />
            <Bar w="60%" h={6} />
          </motion.div>

          <motion.div {...rise(0.35)} className="w-[82%] overflow-hidden rounded-2xl bg-white">
            <div className="grid h-20 place-items-center bg-tile-sun/80">
              <ShoppingBag className="size-8 text-white" strokeWidth={1.6} />
            </div>
            <div className="flex items-center justify-between p-2.5">
              <div className="space-y-1.5">
                <Bar w="60px" h={6} className="bg-ink/70" />
                <span className="block text-[12px] font-semibold text-ink">$24</span>
              </div>
              <div className="h-7 w-14 rounded-full bg-tile-sky" />
            </div>
          </motion.div>

          <motion.div {...rise(0.5)} className={`${bubble} ml-auto w-[55%] bg-tile-sky`}>
            <Bar w="80%" h={6} className="bg-white/80" />
          </motion.div>

          <motion.div
            {...rise(0.65)}
            className={`${bubble} flex w-[70%] items-center gap-2 bg-white`}
          >
            <span className="grid size-5 place-items-center rounded-full bg-tile-mint text-white">
              <Check className="size-3" strokeWidth={3} />
            </span>
            <Bar w="60%" h={6} />
          </motion.div>
        </div>
      </motion.div>

      {/* The owner's side: an order notification. */}
      <motion.div
        {...rise(0.85)}
        className="absolute right-3 top-10 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-3 shadow-[0_24px_50px_-20px_rgba(0,0,0,.45)]"
      >
        <Bell className="size-4 text-tile-sky" />
        <div className="space-y-1.5">
          <Bar w="74px" h={6} className="bg-ink" />
          <span className="block text-[11px] font-semibold text-tile-mint">+ $24</span>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ Store */

export function StoreScene() {
  const tints = ["#ffd9cf", "#ffe7b3", "#d6e4ff", "#d5f5ea", "#f1dcff", "#ffd9cf"];
  return (
    <div className="relative h-full w-full">
      <motion.div
        {...rise()}
        className="absolute inset-x-6 top-4 rounded-2xl bg-white p-5 shadow-[0_40px_80px_-30px_rgba(0,0,0,.45)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <Bar w="90px" h={10} className="bg-ink" />
          <div className="relative grid size-9 place-items-center rounded-full bg-ink text-white">
            <ShoppingBag className="size-4" />
            <span className="absolute -right-1 -top-1 grid size-4.5 place-items-center rounded-full bg-tile-coral text-[10px] font-semibold">
              3
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {tints.map((c, i) => (
            <motion.div key={i} {...rise(0.06 * i)} className="overflow-hidden rounded-xl border border-ink/6">
              <div className="h-[72px]" style={{ background: c }} />
              <div className="space-y-1.5 p-2.5">
                <Bar w="80%" h={6} />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-ink">${12 + i * 7}</span>
                  <div className="size-5 rounded-full bg-ink/[.07]" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <motion.div
        {...rise(0.5)}
        className="absolute bottom-3 right-10 flex items-center gap-3 rounded-full bg-ink px-5 py-3 text-white shadow-[0_24px_50px_-20px_rgba(0,0,0,.6)]"
      >
        <Bar w="70px" h={7} className="bg-white/70" />
        <span className="text-[13px] font-semibold">$57</span>
      </motion.div>
    </div>
  );
}

/* ---------------------------------------------------------------- Booking */

export function BookingScene() {
  return (
    <div className="relative h-full w-full">
      <motion.div
        {...rise()}
        className="absolute left-4 top-4 w-[330px] rounded-2xl bg-white p-5 shadow-[0_40px_80px_-30px_rgba(0,0,0,.45)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <Bar w="96px" h={10} className="bg-ink" />
          <div className="flex gap-1.5">
            <div className="size-6 rounded-full bg-ink/[.06]" />
            <div className="size-6 rounded-full bg-ink/[.06]" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 35 }, (_, i) => {
            const picked = i === 17;
            const busy = [4, 9, 12, 22, 26, 31].includes(i);
            return (
              <div
                key={i}
                className={`grid aspect-square place-items-center rounded-lg text-[11px] font-medium ${
                  picked
                    ? "bg-tile-mint text-white"
                    : busy
                      ? "bg-ink/[.03] text-ink/20 line-through"
                      : "bg-ink/[.04] text-ink/60"
                }`}
              >
                {((i + 26) % 31) + 1}
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        {...rise(0.2)}
        className="absolute right-4 top-16 w-[170px] space-y-2 rounded-2xl bg-white p-4 shadow-[0_40px_80px_-30px_rgba(0,0,0,.45)]"
      >
        {["09:00", "10:30", "12:00", "14:30", "16:00"].map((time, i) => (
          <div
            key={time}
            className={`rounded-lg px-3 py-2 text-[12px] font-medium ${
              i === 2 ? "bg-ink text-white" : "bg-ink/[.04] text-ink/60"
            }`}
          >
            {time}
          </div>
        ))}
      </motion.div>

      <motion.div
        {...rise(0.5)}
        className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-white py-2.5 pl-2.5 pr-5 shadow-[0_24px_50px_-20px_rgba(0,0,0,.45)]"
      >
        <span className="grid size-7 place-items-center rounded-full bg-tile-mint text-white">
          <Check className="size-4" strokeWidth={3} />
        </span>
        <Bar w="110px" h={7} className="bg-ink/70" />
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------- Dashboard */

export function DashboardScene() {
  const bars = [42, 64, 50, 78, 60, 92, 74, 100];
  return (
    <div className="relative grid h-full w-full grid-cols-[1fr_150px] gap-4 p-3">
      <motion.div {...rise()} className="flex flex-col rounded-2xl bg-white/[.06] p-5 ring-1 ring-white/10">
        <div className="flex items-baseline gap-3">
          <span className="text-[34px] font-semibold tracking-tight text-white">+38%</span>
          <Bar w="70px" h={7} className="bg-white/25" />
        </div>
        <div className="mt-auto flex h-[220px] items-end gap-2.5">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 origin-bottom rounded-t-md"
              style={{
                height: `${h}%`,
                background: i === bars.length - 1 ? "var(--color-prism-a)" : "rgba(255,255,255,.18)",
              }}
            />
          ))}
        </div>
      </motion.div>
      <div className="flex flex-col gap-4">
        {[
          { n: "1 284", c: "var(--color-prism-a)" },
          { n: "$9.4k", c: "var(--color-prism-b)" },
          { n: "4.9", c: "var(--color-prism-c)", star: true },
        ].map((k, i) => (
          <motion.div
            key={k.n}
            {...rise(0.15 + i * 0.1)}
            className="flex flex-1 flex-col justify-between rounded-2xl bg-white/[.06] p-4 ring-1 ring-white/10"
          >
            <Bar w="60%" h={6} className="bg-white/20" />
            <span className="flex items-center gap-1.5 text-[22px] font-semibold text-white">
              {k.n}
              {k.star && <Star className="size-4" style={{ color: k.c }} fill="currentColor" />}
            </span>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${60 + i * 12}%`, background: k.c }} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Automation */

export function FlowScene() {
  const nodes = [
    { x: 30, y: 60, icon: FileSpreadsheet, tint: "var(--color-tile-mint)" },
    { x: 210, y: 170, icon: Bot, tint: "var(--color-tile-blue)" },
    { x: 390, y: 60, icon: Mail, tint: "var(--color-tile-coral)" },
    { x: 390, y: 280, icon: Bell, tint: "var(--color-tile-sky)" },
  ];
  // Centres of the 140×80 cards.
  const c = nodes.map((n) => ({ x: n.x + 70, y: n.y + 40 }));
  const paths = [
    `M${c[0].x} ${c[0].y} C ${c[0].x + 90} ${c[0].y}, ${c[1].x - 90} ${c[1].y}, ${c[1].x} ${c[1].y}`,
    `M${c[1].x} ${c[1].y} C ${c[1].x + 90} ${c[1].y}, ${c[2].x - 90} ${c[2].y}, ${c[2].x} ${c[2].y}`,
    `M${c[1].x} ${c[1].y} C ${c[1].x + 90} ${c[1].y}, ${c[3].x - 90} ${c[3].y}, ${c[3].x} ${c[3].y}`,
  ];

  return (
    <div className="relative h-full w-full">
      <svg className="absolute inset-0" width={STAGE_W} height={STAGE_H}>
        {paths.map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke="rgba(11,12,15,.25)" strokeWidth="2" strokeDasharray="5 7" />
            {/* A packet of data travelling along each link. */}
            <circle r="5" fill="var(--color-ink)">
              <animateMotion dur={`${2.4 + i * 0.5}s`} repeatCount="indefinite" path={d} />
            </circle>
          </g>
        ))}
      </svg>
      {nodes.map((n, i) => {
        const Icon = n.icon;
        return (
          <motion.div
            key={i}
            {...rise(i * 0.12)}
            className="absolute flex h-20 w-[140px] items-center gap-3 rounded-2xl bg-white px-4 shadow-[0_24px_50px_-22px_rgba(0,0,0,.45)]"
            style={{ left: n.x, top: n.y }}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl text-white" style={{ background: n.tint }}>
              <Icon className="size-5" strokeWidth={1.8} />
            </span>
            <div className="w-full space-y-1.5">
              <Bar w="90%" h={7} className="bg-ink" />
              <Bar w="60%" h={5} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
