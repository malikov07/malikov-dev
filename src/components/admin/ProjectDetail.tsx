"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  Loader2,
  MessageSquare,
  RotateCcw,
  Save,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StylePreview from "@/components/request/StylePreview";
import { DESIGN_BY_ID, KIND_BY_ID, STATUS_META, type ProjectStatus } from "@/lib/catalog";
import type { AdminProject } from "@/lib/types";
import { formatMoney, LocalTime } from "./LocalTime";

function contactHref(method: string, value: string): string | null {
  const v = value.trim();
  if (method === "telegram") {
    const handle = v.replace(/^@/, "").replace(/^https?:\/\/t\.me\//i, "");
    return /^[\w\d_]{3,}$/.test(handle) ? `https://t.me/${handle}` : null;
  }
  if (method === "phone") return `tel:${v.replace(/[^\d+]/g, "")}`;
  if (method === "email") return `mailto:${v}`;
  return null;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-2.5">
      <dt className="text-[10.5px] uppercase tracking-[0.14em] text-haze-400">
        {label}
      </dt>
      <dd className="mt-1 text-[13.5px] leading-relaxed text-haze-100">{children}</dd>
    </div>
  );
}

export default function ProjectDetail({ project }: { project: AdminProject }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [decision, setDecision] = useState<"accepted" | "rejected" | null>(null);
  /** Set when reopening a decision that was already made. */
  const [changing, setChanging] = useState(false);
  const [comment, setComment] = useState("");
  const [notes, setNotes] = useState(project.adminNotes ?? "");
  const [notesSaved, setNotesSaved] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset local edit state when a different request is selected.
  useEffect(() => {
    setNotes(project.adminNotes ?? "");
    setDecision(null);
    setChanging(false);
    setComment("");
    setShowChat(false);
    setError(null);
    setNotesSaved(false);
  }, [project.id, project.adminNotes]);

  const patch = async (body: unknown, label: string) => {
    setBusy(label);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Update failed.");
      router.refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
      return false;
    } finally {
      setBusy(null);
    }
  };

  const confirmDecision = async () => {
    if (!decision) return;
    const ok = await patch(
      { action: "decide", status: decision, comment: comment.trim() || undefined },
      "decide",
    );
    if (ok) {
      setDecision(null);
      setChanging(false);
      setComment("");
    }
  };

  const saveNotes = async () => {
    const ok = await patch({ action: "notes", adminNotes: notes }, "notes");
    if (ok) {
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete request ${project.ref}? This cannot be undone.`)) return;
    setBusy("delete");
    try {
      await fetch(`/api/admin/projects/${project.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const style = project.designStyle ? DESIGN_BY_ID[project.designStyle] : undefined;
  const meta = STATUS_META[project.status as ProjectStatus] ?? STATUS_META.new;
  const href = contactHref(project.contactMethod, project.contactValue);

  // "new" is the only undecided state; everything else came from a decision
  // (or a status move that followed one).
  const decided = project.status !== "new";
  const decidedLabel =
    project.status === "rejected" ? "Rejected" : "Accepted";

  const budget = project.budgetUnknown
    ? "Not sure — wants a quote"
    : project.budgetMin != null && project.budgetMax != null
      ? project.budgetMin === project.budgetMax
        ? `${formatMoney(project.budgetMin)} ${project.budgetCurrency}`
        : `${formatMoney(project.budgetMin)}–${formatMoney(project.budgetMax)} ${project.budgetCurrency}`
      : project.budgetText || "Not stated";

  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="shrink-0 border-b border-white/8 p-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-xs tracking-widest text-haze-300">
            {project.ref}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${meta.tone}`}
          >
            <span className={`size-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[.04] px-2.5 py-0.5 text-[11px] text-haze-300">
            {KIND_BY_ID[project.kind as keyof typeof KIND_BY_ID]?.label ?? project.kind}
          </span>
          <span className="ml-auto text-[11.5px] text-haze-400">
            <LocalTime iso={project.createdAt} />
          </span>
        </div>

        <h2 className="mt-3 text-xl font-medium leading-snug tracking-tight text-white">
          {project.title}
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {error && (
          <div className="mb-4 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3.5 py-2.5 text-[13px] text-rose-200">
            {error}
          </div>
        )}

        {/* decision */}
        <div className="glass rounded-2xl p-4">
          <AnimatePresence mode="wait">
            {decision ? (
              <motion.div
                key="comment"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-[13px] text-haze-200">
                  {decision === "accepted"
                    ? "Accepting this request. Add a note about scope, price or timing:"
                    : "Rejecting this request. Add the reason:"}
                </p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  autoFocus
                  placeholder={
                    decision === "accepted"
                      ? "e.g. Agreed at $600, two weeks, includes admin panel."
                      : "e.g. Out of scope right now — suggested a simpler version instead."
                  }
                  className="mt-2.5 w-full resize-y rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-2.5 text-[13.5px] text-white outline-none transition placeholder:text-haze-400 focus:border-prism-cyan/60"
                />
                <div className="mt-2.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision(null)}
                    className="rounded-xl border border-white/10 bg-white/[.04] px-4 py-2 text-[13px] text-haze-200 transition hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDecision}
                    disabled={busy === "decide"}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-[13px] font-medium transition disabled:opacity-50 ${
                      decision === "accepted"
                        ? "bg-emerald-400 text-ink-950"
                        : "bg-rose-400 text-ink-950"
                    }`}
                  >
                    {busy === "decide" && <Loader2 className="size-3.5 animate-spin" />}
                    Confirm {decision === "accepted" ? "accept" : "reject"}
                  </button>
                </div>
              </motion.div>
            ) : decided && !changing ? (
              // Already decided: state the outcome instead of re-offering the
              // choice. Accept/Reject only come back via "Change decision".
              <motion.div
                key="decided"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[13px] font-medium ${meta.tone}`}
                  >
                    {project.status === "rejected" ? (
                      <X className="size-4" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    {decidedLabel}
                  </span>

                  {project.decidedAt && (
                    <span className="text-[11.5px] text-haze-400">
                      <LocalTime iso={project.decidedAt} />
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setChanging(true)}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-[12.5px] text-haze-200 transition hover:border-white/25 hover:text-white"
                  >
                    <RotateCcw className="size-3.5" />
                    Change decision
                  </button>
                </div>

                {/* Rejected work has no pipeline to move through. */}
                {project.status !== "rejected" && (
                  <div className="mt-2.5 flex flex-wrap gap-2 border-t border-white/8 pt-2.5">
                    {(["accepted", "in_progress", "done"] as ProjectStatus[]).map(
                      (s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={busy === s || project.status === s}
                          onClick={() => patch({ action: "status", status: s }, s)}
                          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-2 text-[12.5px] text-haze-200 transition hover:border-white/25 hover:text-white disabled:opacity-40"
                        >
                          {busy === s && <Loader2 className="size-3.5 animate-spin" />}
                          {project.status === s
                            ? STATUS_META[s].label
                            : `Move to ${STATUS_META[s].label.toLowerCase()}`}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="buttons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {changing && (
                  <p className="mb-2.5 text-[12.5px] text-haze-300">
                    Currently {meta.label.toLowerCase()}. Pick a new outcome, or
                    cancel to leave it as it is.
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision("accepted")}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-400/10 py-2.5 text-[13px] font-medium text-emerald-200 transition hover:bg-emerald-400/20"
                  >
                    <Check className="size-4" />
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision("rejected")}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-300/30 bg-rose-400/10 py-2.5 text-[13px] font-medium text-rose-200 transition hover:bg-rose-400/20"
                  >
                    <X className="size-4" />
                    Reject
                  </button>
                  {changing && (
                    <button
                      type="button"
                      onClick={() => setChanging(false)}
                      className="rounded-xl border border-white/10 bg-white/[.04] px-4 py-2.5 text-[13px] text-haze-200 transition hover:text-white"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {project.adminComment && !decision && (
            <div className="mt-3 rounded-xl border border-white/8 bg-white/[.03] p-3">
              <div className="text-[10.5px] uppercase tracking-[0.14em] text-haze-400">
                Decision note
              </div>
              <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-haze-100">
                {project.adminComment}
              </p>
            </div>
          )}
        </div>

        {/* the brief */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
          <dl className="divide-y divide-white/5">
            <Field label="Summary">{project.summary}</Field>

            {!!project.features.length && (
              <Field label="Features">
                <ul className="space-y-1">
                  {project.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="mt-[7px] size-1 shrink-0 rounded-full bg-prism-cyan" />
                      {f}
                    </li>
                  ))}
                </ul>
              </Field>
            )}

            {!!project.scope.length && (
              <Field label="Scope">{project.scope.join(" · ")}</Field>
            )}
            {project.audience && <Field label="Audience">{project.audience}</Field>}
            {!!project.languages.length && (
              <Field label="Languages">
                {project.languages.join(", ").toUpperCase()}
              </Field>
            )}
            {project.timeline && <Field label="Timeline">{project.timeline}</Field>}
            {project.references && <Field label="References">{project.references}</Field>}
            {style && <Field label="Design style">{style.label}</Field>}
          </dl>

          {style && (
            <div className="w-full lg:w-[170px]">
              <div className="overflow-hidden rounded-xl border border-white/12">
                <StylePreview style={style} className="h-[104px]" />
              </div>
              <p className="mt-1.5 text-center text-[10.5px] text-haze-400">
                {style.label}
              </p>
            </div>
          )}
        </div>

        {/* contact + budget */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em] text-haze-400">
              <MessageSquare className="size-3.5" />
              Contact
            </div>
            <p className="mt-2 text-[15px] font-medium text-white">
              {project.contactName}
            </p>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-[13.5px] text-prism-cyan transition hover:underline"
              >
                {project.contactValue}
                <ExternalLink className="size-3" />
              </a>
            ) : (
              <p className="mt-1 text-[13.5px] text-haze-200">{project.contactValue}</p>
            )}
            <p className="mt-2.5 flex items-center gap-1.5 text-[12.5px] text-haze-300">
              <Clock className="size-3.5" />
              Free: {project.availability}
            </p>
            {project.timezone && (
              <p className="mt-1 text-[11.5px] text-haze-400">{project.timezone}</p>
            )}
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em] text-haze-400">
              <Wallet className="size-3.5" />
              Budget
            </div>
            <p className="mt-2 text-[15px] font-medium text-white">{budget}</p>
            {project.budgetText && !project.budgetUnknown && (
              <p className="mt-1.5 text-[12.5px] italic text-haze-300">
                &ldquo;{project.budgetText}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* private notes */}
        <div className="glass mt-4 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] uppercase tracking-[0.14em] text-haze-400">
              Private notes
            </span>
            <span className="text-[10.5px] text-haze-400">Only you see this</span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Anything you want to remember about this one…"
            className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-2.5 text-[13.5px] text-white outline-none transition placeholder:text-haze-400 focus:border-prism-cyan/60"
          />
          <button
            type="button"
            onClick={saveNotes}
            disabled={busy === "notes" || notes === (project.adminNotes ?? "")}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[.04] px-3 py-1.5 text-[12.5px] text-haze-200 transition hover:text-white disabled:opacity-40"
          >
            {busy === "notes" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : notesSaved ? (
              <Check className="size-3.5 text-emerald-300" />
            ) : (
              <Save className="size-3.5" />
            )}
            {notesSaved ? "Saved" : "Save notes"}
          </button>
        </div>

        {/* transcript */}
        <div className="glass mt-4 overflow-hidden rounded-2xl">
          <button
            type="button"
            onClick={() => setShowChat((v) => !v)}
            className="flex w-full items-center gap-2 px-4 py-3 text-left"
          >
            <span className="text-[10.5px] uppercase tracking-[0.14em] text-haze-400">
              Conversation
            </span>
            <span className="text-[11px] text-haze-400">
              {project.transcript.length} messages
            </span>
            <motion.span
              animate={{ rotate: showChat ? 180 : 0 }}
              className="ml-auto text-haze-400"
            >
              <ChevronDown className="size-4" />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {showChat && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="space-y-2 border-t border-white/8 p-4">
                  {project.transcript.map((m, i) => (
                    <div
                      key={i}
                      className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                    >
                      <div
                        className={
                          m.role === "user"
                            ? "max-w-[80%] whitespace-pre-wrap rounded-xl rounded-br-sm bg-white/90 px-3 py-2 text-[12.5px] leading-relaxed text-ink-950"
                            : "max-w-[85%] whitespace-pre-wrap rounded-xl rounded-bl-sm border border-white/10 bg-white/[.05] px-3 py-2 text-[12.5px] leading-relaxed text-haze-100"
                        }
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* history */}
        {project.events.length > 0 && (
          <div className="mt-4">
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-haze-400">
              History
            </div>
            <ol className="mt-2 space-y-1.5">
              {project.events.map((e) => (
                <li key={e.id} className="flex gap-2.5 text-[12.5px] text-haze-300">
                  <span className="mt-[7px] size-1 shrink-0 rounded-full bg-white/25" />
                  <span className="flex-1">
                    {e.type === "created"
                      ? "Request received"
                      : `${e.fromStatus ?? "—"} → ${e.toStatus ?? "—"}`}
                    {e.comment && (
                      <span className="block text-haze-400">“{e.comment}”</span>
                    )}
                  </span>
                  <span className="shrink-0 text-haze-400">
                    <LocalTime iso={e.createdAt} />
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <button
          type="button"
          onClick={remove}
          disabled={busy === "delete"}
          className="mt-6 inline-flex items-center gap-1.5 text-[12.5px] text-haze-400 transition hover:text-rose-300 disabled:opacity-50"
        >
          <Trash2 className="size-3.5" />
          Delete this request
        </button>
      </div>
    </div>
  );
}
