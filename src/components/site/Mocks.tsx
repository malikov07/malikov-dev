"use client";

import { motion } from "motion/react";

/**
 * Abstract UI mocks for the showcase cards.
 *
 * These are deliberately wireframe-like rather than fake screenshots: they
 * communicate the shape of each project type without pretending to be a real
 * client's product.
 */

const bar = "rounded-full bg-white/22";
const dim = "rounded-full bg-white/10";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[.07] to-white/[.02] p-3">
      <div className="mb-2.5 flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 rounded-full bg-white/20" />
        ))}
      </div>
      {children}
    </div>
  );
}

export function LandingMock() {
  return (
    <Frame>
      <div className="space-y-1.5">
        <div className={`h-2 w-2/3 ${bar}`} />
        <div className={`h-1.5 w-full ${dim}`} />
        <div className={`h-1.5 w-4/5 ${dim}`} />
        <div className="flex gap-1.5 pt-1">
          <div className="h-3.5 w-12 rounded-full bg-gradient-to-r from-prism-cyan to-prism-violet" />
          <div className="h-3.5 w-10 rounded-full border border-white/20" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-9 rounded-md border border-white/10 bg-white/[.05]"
            animate={{ y: [0, -3, 0] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              delay: i * 0.35,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </Frame>
  );
}

export function StoreMock() {
  return (
    <Frame>
      <div className="mb-2 flex items-center justify-between">
        <div className={`h-1.5 w-10 ${bar}`} />
        <div className="h-3 w-8 rounded-full bg-gradient-to-r from-prism-violet to-prism-pink" />
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-md border border-white/10 bg-white/[.04]"
          >
            <div
              className="h-7"
              style={{
                background: `linear-gradient(135deg, rgba(94,231,255,${0.16 + (i % 3) * 0.08}), rgba(255,107,214,.12))`,
              }}
            />
            <div className="space-y-1 p-1">
              <div className={`h-1 w-full ${dim}`} />
              <div className={`h-1 w-1/2 ${bar}`} />
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function DashboardMock() {
  const heights = [40, 62, 34, 78, 55, 90, 48];
  return (
    <Frame>
      <div className="flex h-[calc(100%-18px)] gap-2">
        <div className="w-8 shrink-0 space-y-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 ${i === 1 ? "w-full bg-prism-cyan/70" : "w-3/4 bg-white/12"} rounded-full`}
            />
          ))}
        </div>
        <div className="flex flex-1 items-end gap-1">
          {heights.map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-sm bg-gradient-to-t from-prism-violet/70 to-prism-cyan/70"
              initial={{ height: "10%" }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{
                duration: 0.9,
                delay: i * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          ))}
        </div>
      </div>
    </Frame>
  );
}

export function BotChatMock() {
  const bubbles = [
    { me: false, w: "72%" },
    { me: true, w: "52%" },
    { me: false, w: "84%" },
  ];
  return (
    <Frame>
      <div className="space-y-1.5">
        {bubbles.map((b, i) => (
          <motion.div
            key={i}
            className={`flex ${b.me ? "justify-end" : "justify-start"}`}
            initial={{ opacity: 0, x: b.me ? 12 : -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 * i, duration: 0.5 }}
          >
            <div
              className={`h-5 rounded-lg ${
                b.me
                  ? "rounded-br-sm bg-gradient-to-r from-prism-cyan/60 to-prism-cyan/30"
                  : "rounded-bl-sm border border-white/10 bg-white/[.07]"
              }`}
              style={{ width: b.w }}
            />
          </motion.div>
        ))}
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-4 rounded-md border border-white/12 bg-white/[.05]"
          />
        ))}
      </div>
    </Frame>
  );
}

export function BookingMock() {
  return (
    <Frame>
      <div className={`mb-2 h-1.5 w-14 ${bar}`} />
      <div className="grid grid-cols-7 gap-[3px]">
        {Array.from({ length: 21 }).map((_, i) => {
          const active = i === 9 || i === 16;
          return (
            <div
              key={i}
              className={`aspect-square rounded-[3px] ${
                active
                  ? "bg-gradient-to-br from-prism-cyan to-prism-violet"
                  : i % 5 === 0
                    ? "bg-white/[.12]"
                    : "bg-white/[.05]"
              }`}
            />
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5">
        <div className="h-3.5 flex-1 rounded-full border border-white/15" />
        <div className="h-3.5 w-10 rounded-full bg-white/80" />
      </div>
    </Frame>
  );
}

export function AutomationMock() {
  return (
    <Frame>
      <svg viewBox="0 0 120 62" className="h-full w-full">
        <defs>
          <linearGradient id="flow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5ee7ff" />
            <stop offset="100%" stopColor="#ff6bd6" />
          </linearGradient>
        </defs>

        {[
          "M14,14 C44,14 44,31 74,31",
          "M14,31 C44,31 44,31 74,31",
          "M14,48 C44,48 44,31 74,31",
          "M74,31 C92,31 92,20 106,20",
          "M74,31 C92,31 92,44 106,44",
        ].map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke="url(#flow)"
            strokeWidth="1.1"
            strokeOpacity="0.75"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.1 * i, ease: "easeInOut" }}
          />
        ))}

        {[
          [14, 14],
          [14, 31],
          [14, 48],
          [106, 20],
          [106, 44],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="4" fill="rgba(255,255,255,.16)" stroke="rgba(255,255,255,.3)" strokeWidth="0.8" />
        ))}

        <rect
          x="64"
          y="22"
          width="20"
          height="18"
          rx="4"
          fill="rgba(94,231,255,.18)"
          stroke="rgba(94,231,255,.55)"
          strokeWidth="0.9"
        />
      </svg>
    </Frame>
  );
}
