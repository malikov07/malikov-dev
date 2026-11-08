"use client";

import { useEffect, useRef } from "react";
import { DESIGN_STYLES } from "@/lib/catalog";
import StylePreview from "@/components/request/StylePreview";
import { useLocale, useT } from "@/components/i18n/LocaleProvider";
import { fill } from "@/lib/i18n";
import { styleCopy } from "@/lib/i18n/styles";
import { Reveal } from "@/components/ui/Reveal";
import Section from "./Section";
import { RequestTrigger } from "./RequestButton";

/** Localised label and one-line description for a style. */
function useStyleText() {
  const { locale } = useLocale();
  return (style: (typeof DESIGN_STYLES)[number]) => ({
    label: styleCopy(locale, style.id)?.label ?? style.label,
    description: styleCopy(locale, style.id)?.description ?? style.description,
  });
}

/* ==========================================================================
   Phone: one row, swiped by hand.

   On a touchscreen a moving strip is the wrong interaction entirely — nothing
   stays put long enough to read, and "hover to pause" is not a gesture a thumb
   can make. The overflow and snap utilities do the work.
   ========================================================================== */

function SwipeRow() {
  const t = useT();
  const text = useStyleText();

  return (
    <div className="hide-scrollbar relative -mx-5 snap-x snap-mandatory scroll-px-5 overflow-x-auto overflow-y-hidden py-2">
      <div className="flex w-max gap-3 px-5">
        {DESIGN_STYLES.map((style) => {
          const { label, description } = text(style);
          return (
            <RequestTrigger
              key={style.id}
              kind="website"
              aria-label={fill(t.styles.requestAria, { label })}
              className="w-[190px] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 text-left"
            >
              <StylePreview style={style} className="h-[112px]" />
              <div className="border-t border-white/8 bg-ink-900/70 px-3 py-2.5 backdrop-blur-sm">
                <div className="text-[13px] font-medium text-white">{label}</div>
                <div className="mt-0.5 line-clamp-1 text-[11px] text-haze-400">
                  {description}
                </div>
              </div>
            </RequestTrigger>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   Tablet and up: the ten styles on a turning 3D ring.

   CSS 3D rather than WebGL: the cards are real buttons with real text, so they
   stay crisp, clickable and reachable by keyboard and screen reader. One rAF
   loop writes each card's transform directly — React does not re-render while
   it turns.
   ========================================================================== */

function Ring() {
  const t = useT();
  const text = useStyleText();
  const stage = useRef<HTMLDivElement | null>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const n = DESIGN_STYLES.length;
  const step = 360 / n;

  // Shared between the loop and the event handlers below.
  const state = useRef({
    angle: 0,
    /** Degrees per second from drags and scroll, decaying back to the idle spin. */
    velocity: 0,
    hover: false,
    dragging: false,
    dragMoved: 0,
    lastX: 0,
    /** Angle to settle on when a card takes keyboard focus. */
    focusTarget: null as number | null,
  });

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const s = state.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const IDLE = reduced ? 0 : -7; // deg/s

    let radius = 420;
    const measure = () => {
      radius = Math.max(260, Math.min(470, el.clientWidth * 0.4));
    };
    measure();

    const layout = () => {
      for (let i = 0; i < n; i++) {
        const card = cards.current[i];
        if (!card) continue;
        // Wrapped to -180..180, so the partial turn below has no seam at the back.
        const theta = ((((i * step + s.angle) % 360) + 540) % 360) - 180;
        const rad = (theta * Math.PI) / 180;
        const c = Math.cos(rad);
        // An ellipse, cards mostly facing the viewer: on a true cylinder the
        // side cards turn edge-on and only three are ever readable.
        const x = Math.sin(rad) * radius;
        const z = (c - 1) * radius * 0.75;
        // Solid across the front arc, fading only as cards head round the back
        // (a smoothstep from cos -0.6 to cos 0.75).
        const k = Math.min(1, Math.max(0, (c + 0.6) / 1.35));
        const front = k * k * (3 - 2 * k);
        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, 0, ${z}px) rotateY(${theta * 0.28}deg)`;
        card.style.opacity = String(0.1 + 0.9 * front);
        card.style.pointerEvents = c > 0.5 ? "auto" : "none";
      }
    };
    layout();

    let raf = 0;
    let last = performance.now();
    let running = false;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (s.focusTarget !== null) {
        // Shortest way round to the focused card.
        let d = ((s.focusTarget - s.angle) % 360 + 540) % 360 - 180;
        s.angle += d * Math.min(1, dt * 7);
        s.velocity = 0;
        if (Math.abs(d) < 0.05) s.focusTarget = null;
      } else if (!s.dragging) {
        const idle = s.hover ? 0 : IDLE;
        s.velocity += (idle - s.velocity) * Math.min(1, dt * 2.2);
        s.angle += s.velocity * dt;
      }

      layout();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Only spin while on screen.
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    });
    io.observe(el);

    // Scrolling past nudges the ring round, so it feels connected to the page.
    let lastScroll = window.scrollY;
    const onScroll = () => {
      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      if (running && !reduced) s.velocity -= dy * 0.9;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      measure();
      layout();
    });
    ro.observe(el);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [n, step]);

  const s = state.current;

  return (
    <div
      ref={stage}
      className="relative mx-auto h-[380px] w-full touch-pan-y select-none [perspective:1800px]"
      onPointerEnter={() => (s.hover = true)}
      onPointerLeave={() => {
        s.hover = false;
        s.dragging = false;
      }}
      onPointerDown={(e) => {
        s.dragging = true;
        s.dragMoved = 0;
        s.lastX = e.clientX;
        s.velocity = 0;
        s.focusTarget = null;
      }}
      onPointerMove={(e) => {
        if (!s.dragging) return;
        const dx = e.clientX - s.lastX;
        s.lastX = e.clientX;
        s.dragMoved += Math.abs(dx);
        s.angle += dx * 0.22;
        // Remember the throw so the ring keeps turning after release.
        s.velocity = dx * 0.22 * 60;
      }}
      onPointerUp={() => (s.dragging = false)}
      onPointerCancel={() => (s.dragging = false)}
      // A drag that ends over a card would otherwise also click it.
      onClickCapture={(e) => {
        if (s.dragMoved > 6) {
          e.preventDefault();
          e.stopPropagation();
        }
        s.dragMoved = 0;
      }}
    >
      {/* Floor glow under the ring. */}
      <div className="pointer-events-none absolute inset-x-[12%] bottom-2 h-24 rounded-[50%] bg-[radial-gradient(closest-side,rgba(95,139,255,.28),rgba(108,242,200,.10)_60%,transparent)] blur-xl" />

      <div className="absolute inset-0 [transform-style:preserve-3d] [transform:rotateX(-7deg)]">
        {DESIGN_STYLES.map((style, i) => {
          const { label, description } = text(style);
          return (
            <div
              key={style.id}
              ref={(node) => {
                cards.current[i] = node;
              }}
              className="absolute left-1/2 top-1/2 w-[220px] will-change-transform"
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <RequestTrigger
                kind="website"
                aria-label={fill(t.styles.requestAria, { label })}
                onFocus={() => {
                  s.focusTarget = -i * step;
                }}
                className="group block w-full overflow-hidden rounded-2xl border border-white/12 bg-ink-900 text-left shadow-[0_30px_60px_-30px_rgba(0,0,0,.9)] transition-[border-color,box-shadow,translate] duration-500 hover:-translate-y-2 hover:border-white/35 hover:shadow-[0_30px_70px_-24px_rgba(108,242,200,.45)]"
              >
                <StylePreview style={style} className="h-[128px]" />
                <div className="border-t border-white/8 bg-ink-900/80 px-3.5 py-3">
                  <div className="text-[13.5px] font-medium text-white">{label}</div>
                  <div className="mt-0.5 line-clamp-1 text-[11.5px] text-haze-400">
                    {description}
                  </div>
                </div>
              </RequestTrigger>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StyleStrip() {
  const t = useT();
  return (
    <Section
      id="styles"
      tone="dark"
      align="center"
      eyebrow={t.styles.eyebrow}
      title={t.styles.title}
      accent={t.styles.accent}
      lead={t.styles.lead}
    >
      <Reveal direction="blur">
        <div className="sm:hidden">
          <SwipeRow />
        </div>
        <div className="hidden sm:block">
          <Ring />
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        {/* Two strings rather than a media query in JS: the right one is chosen
            during paint, so it never renders the wrong gesture then swaps. */}
        <p className="mt-6 text-center text-xs text-haze-400">
          <span className="sm:hidden">{t.styles.noteTouch}</span>
          <span className="hidden sm:inline">{t.styles.note}</span>
        </p>
      </Reveal>
    </Section>
  );
}
