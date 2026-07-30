"use client";

import { motion } from "motion/react";
import { ArrowLeft, Inbox, LogOut, RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { STATUSES, STATUS_META, type ProjectStatus } from "@/lib/catalog";
import type { AdminProject } from "@/lib/types";
import { formatMoney, RelativeTime } from "./LocalTime";
import ProjectDetail from "./ProjectDetail";

type Filter = "all" | ProjectStatus;

/** Compact budget for the list card — a range must not read as a single figure. */
function budgetChip(p: AdminProject): string {
  if (p.budgetUnknown) return "no budget";
  const { budgetMin: min, budgetMax: max, budgetCurrency: cur } = p;
  if (min == null && max == null) return "—";
  if (min != null && max != null && min !== max) {
    return `${formatMoney(min)}–${formatMoney(max)} ${cur}`;
  }
  return `${formatMoney((min ?? max)!)} ${cur}`;
}

export default function AdminDashboard({
  projects,
}: {
  projects: AdminProject[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // On desktop both panes are visible, so opening the newest request is
  // helpful. On mobile the detail pane replaces the list, so doing the same
  // would hide the list behind a request the user never asked for.
  useEffect(() => {
    if (selectedId || projects.length === 0) return;
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setSelectedId(projects[0].id);
    }
  }, [projects, selectedId]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: projects.length };
    for (const s of STATUSES) map[s] = 0;
    for (const p of projects) map[p.status] = (map[p.status] ?? 0) + 1;
    return map;
  }, [projects]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (!q) return true;
      return (
        p.ref.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.contactName.toLowerCase().includes(q) ||
        p.contactValue.toLowerCase().includes(q)
      );
    });
  }, [projects, filter, query]);

  // Keep the selection valid as filters narrow the list.
  const selected =
    visible.find((p) => p.id === selectedId) ??
    projects.find((p) => p.id === selectedId) ??
    null;

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  };

  const refresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 700);
  };

  return (
    <div className="relative min-h-[100svh]">
      {/* Muted version of the site's ambience — this is a workspace. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(80% 60% at 15% 0%, #1a1440 0%, transparent 55%)," +
            "radial-gradient(60% 50% at 90% 10%, #072b3a 0%, transparent 60%)," +
            "#04050a",
        }}
      />

      <header className="sticky top-0 z-30 border-b border-white/8 bg-ink-950/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3">
          <span className="relative grid size-8 shrink-0 place-items-center">
            <span className="absolute inset-0 rounded-[10px] bg-[conic-gradient(from_0deg,var(--color-prism-cyan),var(--color-prism-violet),var(--color-prism-pink),var(--color-prism-cyan))]" />
            <span className="absolute inset-[1.5px] rounded-[8.5px] bg-ink-950" />
            <span className="relative text-[13px] font-semibold text-white">M</span>
          </span>

          <div className="min-w-0">
            <h1 className="text-sm font-medium tracking-tight text-white">
              Requests
            </h1>
            <p className="text-[11px] text-haze-400">
              {counts.new ?? 0} new · {projects.length} total
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={refresh}
              aria-label="Refresh"
              className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[.04] text-haze-300 transition hover:text-white"
            >
              <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[.04] px-3.5 py-2 text-[13px] text-haze-200 transition hover:text-white"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-4 p-4 lg:grid-cols-[minmax(300px,380px)_1fr]">
        {/* list */}
        <div
          className={`flex flex-col gap-3 ${selected ? "hidden lg:flex" : "flex"}`}
        >
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-haze-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, ref, or text…"
              className="w-full rounded-xl border border-white/10 bg-white/[.04] py-2.5 pl-10 pr-3.5 text-[13.5px] text-white outline-none transition placeholder:text-haze-400 focus:border-prism-cyan/60"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(["all", ...STATUSES] as Filter[]).map((f) => {
              const on = filter === f;
              const label = f === "all" ? "All" : STATUS_META[f].label;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] transition ${
                    on
                      ? "border-white/30 bg-white/[.10] text-white"
                      : "border-white/10 bg-white/[.03] text-haze-300 hover:text-white"
                  }`}
                >
                  {label}
                  <span className="ml-1.5 text-haze-400">{counts[f] ?? 0}</span>
                </button>
              );
            })}
          </div>

          <div className="hide-scrollbar space-y-2 overflow-y-auto lg:max-h-[calc(100svh-190px)]">
            {visible.length === 0 && (
              <div className="glass flex flex-col items-center rounded-2xl px-6 py-14 text-center">
                <Inbox className="size-7 text-haze-400" strokeWidth={1.4} />
                <p className="mt-3 text-sm text-haze-200">
                  {projects.length === 0
                    ? "No requests yet."
                    : "Nothing matches that."}
                </p>
                <p className="mt-1 text-[12.5px] text-haze-400">
                  {projects.length === 0
                    ? "They'll appear here the moment someone finishes the chat."
                    : "Try a different search or filter."}
                </p>
              </div>
            )}

            {visible.map((p, i) => {
              const meta = STATUS_META[p.status as ProjectStatus] ?? STATUS_META.new;
              const on = selected?.id === p.id;
              return (
                <motion.button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3) }}
                  className={`glass w-full rounded-2xl p-3.5 text-left transition-all duration-300 ${
                    on
                      ? "border-prism-cyan/50 shadow-[0_0_0_1px_rgba(94,231,255,.35)]"
                      : "hover:border-white/25"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`size-1.5 shrink-0 rounded-full ${meta.dot}`} />
                    <span className="font-mono text-[10.5px] tracking-widest text-haze-400">
                      {p.ref}
                    </span>
                    <span className="ml-auto text-[10.5px] text-haze-400">
                      <RelativeTime iso={p.createdAt} />
                    </span>
                  </div>

                  <p className="mt-1.5 line-clamp-1 text-[14px] font-medium text-white">
                    {p.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-haze-400">
                    {p.summary}
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-[11px] text-haze-300">
                    <span className="truncate">{p.contactName}</span>
                    <span className="ml-auto shrink-0 rounded-full border border-white/8 bg-white/[.04] px-2 py-0.5">
                      {budgetChip(p)}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* detail */}
        <div className={`${selected ? "block" : "hidden lg:block"}`}>
          {selected ? (
            <div className="glass-strong overflow-hidden rounded-2xl lg:h-[calc(100svh-96px)]">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5 text-[13px] text-haze-300 transition hover:text-white lg:hidden"
              >
                <ArrowLeft className="size-4" />
                All requests
              </button>
              <ProjectDetail project={selected} />
            </div>
          ) : (
            <div className="glass flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl px-6 py-20 text-center">
              <Inbox className="size-8 text-haze-400" strokeWidth={1.3} />
              <p className="mt-4 text-sm text-haze-200">Select a request</p>
              <p className="mt-1 text-[12.5px] text-haze-400">
                Pick one from the list to see the full brief.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
