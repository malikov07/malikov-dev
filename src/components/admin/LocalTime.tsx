"use client";

import { useEffect, useState } from "react";

/**
 * Timestamps rendered in the viewer's own locale and timezone.
 *
 * Formatting straight from `toLocaleString()` during render is a hydration
 * hazard: the server formats in its locale/timezone (UTC on most hosts) and
 * the browser formats in the user's, so the two HTML strings differ. Both
 * components below render a deterministic UTC string first — identical on
 * server and client — then swap to the local rendering after mount.
 */

function utcStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function LocalTime({ iso }: { iso: string }) {
  const [text, setText] = useState(() => utcStamp(iso));

  useEffect(() => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return;
    setText(
      d.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, [iso]);

  return <>{text}</>;
}

export function RelativeTime({ iso }: { iso: string }) {
  // `Date.now()` is non-deterministic, so the first paint uses the absolute
  // stamp and the relative form appears once we're client-side.
  const [text, setText] = useState(() => utcStamp(iso));

  useEffect(() => {
    const compute = () => {
      const diff = Date.now() - new Date(iso).getTime();
      const mins = Math.round(diff / 60_000);
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.round(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.round(hours / 24);
      // Past a month, an exact date is more useful than "47d ago". Safe to
      // localise here: this only ever runs client-side.
      return days < 30
        ? `${days}d ago`
        : new Date(iso).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
    };

    setText(compute());
    const id = setInterval(() => setText(compute()), 60_000);
    return () => clearInterval(id);
  }, [iso]);

  return <>{text}</>;
}

/** Locale-pinned so server and client agree on separators. */
export function formatMoney(n: number): string {
  return n.toLocaleString("en-US");
}
