"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  Copy,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectKind } from "@/lib/catalog";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { fill } from "@/lib/i18n";
import type { AssistantTurn, Brief, ChatMessage, Stage } from "@/lib/types";
import { BudgetPicker, ContactForm, SummaryCard } from "./ChatWidgets";
import DesignGallery from "./DesignGallery";

type Widget = NonNullable<AssistantTurn["ui"]>;

const STAGE_ORDER: Stage[] = [
  "discovery",
  "design",
  "details",
  "contact",
  "budget",
  "review",
  "complete",
];

/** Later notes win, but never let a filled field be blanked by an empty one. */
function mergeBrief(current: Brief, patch: Brief | undefined): Brief {
  if (!patch) return current;
  const next: Brief = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    (next as Record<string, unknown>)[key] = value;
  }
  return next;
}

export default function IntakeChat({
  kind,
  onBack,
  onClose,
}: {
  kind: ProjectKind;
  onBack: () => void;
  onClose: () => void;
}) {
  const { locale, t } = useLocale();

  const greeting =
    kind === "website"
      ? t.chat.greetingWebsite
      : kind === "telegram_bot"
        ? t.chat.greetingBot
        : t.chat.greetingOther;

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { role: "assistant", content: greeting, at: Date.now() },
  ]);
  const [brief, setBrief] = useState<Brief>({ kind });
  const [widget, setWidget] = useState<Widget>({});
  const [stage, setStage] = useState<Stage>("discovery");
  const [pending, setPending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sentRef, setSentRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  // Guards against double-submitting when the model sets done and the user
  // also presses confirm.
  const submitted = useRef(false);

  const scrollToEnd = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    });
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, widget, pending, scrollToEnd]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = useCallback(
    async (finalBrief: Brief, finalMessages: ChatMessage[]) => {
      if (submitted.current) return;
      submitted.current = true;
      setSubmitting(true);
      setError(null);

      try {
        const res = await fetch("/api/requests", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            kind,
            brief: finalBrief,
            messages: finalMessages.slice(-60),
            locale,
          }),
        });
        const data = (await res.json()) as { ref?: string; error?: string };
        if (!res.ok || !data.ref) {
          throw new Error(data.error ?? t.chat.errorSend);
        }
        setSentRef(data.ref);
      } catch (err) {
        submitted.current = false;
        setError(err instanceof Error ? err.message : t.chat.errorSend);
      } finally {
        setSubmitting(false);
      }
    },
    [kind, locale, t.chat.errorSend],
  );

  const send = useCallback(
    async (text: string, patch?: Brief) => {
      const trimmed = text.trim();
      if ((!trimmed && !patch) || pending || submitting) return;

      const nextMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: trimmed, at: Date.now() },
      ];
      const nextBrief = mergeBrief(brief, patch);

      setMessages(nextMessages);
      setBrief(nextBrief);
      setInput("");
      setWidget({});
      setPending(true);
      setError(null);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            kind,
            messages: nextMessages.slice(-40),
            brief: nextBrief,
            locale,
          }),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? t.chat.errorGeneric);
        }

        const { turn } = (await res.json()) as { turn: AssistantTurn };
        const merged = mergeBrief(nextBrief, turn.notes);

        setBrief(merged);
        setStage(turn.stage);
        setWidget(turn.ui ?? {});

        const withReply: ChatMessage[] = [
          ...nextMessages,
          { role: "assistant", content: turn.reply, at: Date.now() },
        ];
        setMessages(withReply);

        if (turn.done) void submit(merged, withReply);
      } catch (err) {
        setError(err instanceof Error ? err.message : t.chat.errorGeneric);
      } finally {
        setPending(false);
      }
    },
    [messages, brief, kind, pending, submitting, submit, locale, t.chat.errorGeneric],
  );

  const busy = pending || submitting;
  const stageIndex = STAGE_ORDER.indexOf(stage);
  const progress = sentRef
    ? 100
    : Math.max(8, (stageIndex / (STAGE_ORDER.length - 1)) * 100);

  // ---- success ------------------------------------------------------------
  if (sentRef) {
    return (
      <div className="p-8 pt-12 text-center sm:p-12">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
          className="mx-auto grid size-16 place-items-center rounded-full border border-emerald-300/30 bg-emerald-400/10"
        >
          <CheckCircle2 className="size-8 text-emerald-300" strokeWidth={1.5} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-5 text-2xl font-medium tracking-tight text-white"
        >
          {t.success.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-haze-300"
        >
          {t.success.bodyA}{" "}
          <span className="text-white">{brief.contactValue}</span>
          {t.success.bodyB}
        </motion.p>

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          onClick={() => {
            void navigator.clipboard?.writeText(sentRef);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
          className="glass mx-auto mt-6 flex items-center gap-2.5 rounded-xl px-4 py-2.5 font-mono text-lg tracking-widest text-white transition hover:border-white/25"
        >
          {sentRef}
          <Copy className="size-3.5 text-haze-400" />
          {copied && (
            <span className="text-[11px] font-sans tracking-normal text-emerald-300">
              {t.success.copied}
            </span>
          )}
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.36 }}
          className="mt-6 text-xs text-haze-400"
        >
          {t.success.note}
        </motion.p>

        <button
          type="button"
          onClick={onClose}
          className="mt-7 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-ink-950 transition hover:shadow-[0_10px_30px_-10px_rgba(94,231,255,.8)]"
        >
          {t.success.done}
        </button>
      </div>
    );
  }

  // ---- conversation -------------------------------------------------------
  return (
    <div className="flex h-[min(78vh,700px)] flex-col">
      {/* header */}
      <div className="relative shrink-0 border-b border-white/8 px-4 py-3 pr-14 sm:px-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="grid size-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[.04] text-haze-300 transition hover:bg-white/10 hover:text-white"
            aria-label={t.chat.back}
          >
            <ArrowLeft className="size-4" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-prism-cyan" />
              <span className="truncate text-sm font-medium text-white">
                {t.kinds[kind].label} {t.chat.headerSuffix}
              </span>
            </div>
            <p className="truncate text-[11px] text-haze-400">
              {t.chat.headerHint}
            </p>
          </div>
        </div>

        {/* progress */}
        <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-white/8">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-prism-cyan via-prism-violet to-prism-pink"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* transcript */}
      <div
        ref={scrollRef}
        className="hide-scrollbar flex-1 space-y-3.5 overflow-y-auto px-4 py-5 sm:px-5"
      >
        {messages.map((m, i) => (
          <motion.div
            key={`${i}-${m.at ?? 0}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-white px-4 py-2.5 text-[14px] leading-relaxed text-ink-950"
                  : "max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-white/15 bg-white/[.11] px-4 py-2.5 text-[14px] leading-relaxed text-haze-100"
              }
            >
              {m.content}
            </div>
          </motion.div>
        ))}

        {pending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/15 bg-white/[.11] px-4 py-3.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="size-1.5 rounded-full bg-haze-300"
                  animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    delay: i * 0.16,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* inline widgets — rendered under the message that asked for them */}
        <AnimatePresence mode="wait">
          {!pending && widget.designPicker && (
            <DesignGallery
              key="design"
              selected={brief.designStyle}
              disabled={busy}
              onSelect={(id, label) =>
                send(
                  id ? fill(t.design.pickEcho, { label }) : label,
                  id ? { designStyle: id } : undefined,
                )
              }
            />
          )}

          {!pending && widget.contactForm && (
            <ContactForm
              key="contact"
              disabled={busy}
              onSubmit={(patch, echo) => send(echo, patch)}
            />
          )}

          {!pending && widget.budgetPicker && (
            <BudgetPicker
              key="budget"
              disabled={busy}
              onSubmit={(patch, echo) => send(echo, patch)}
            />
          )}

          {!pending && widget.summary && (
            <SummaryCard
              key="summary"
              kind={kind}
              brief={brief}
              busy={submitting}
              onConfirm={() => void submit(brief, messages)}
              onEdit={() => {
                setWidget({});
                inputRef.current?.focus();
              }}
            />
          )}
        </AnimatePresence>

        {/* quick replies */}
        {!pending && !!widget.quickReplies?.length && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-1.5 pt-1"
          >
            {widget.quickReplies.map((q) => (
              <button
                key={q}
                type="button"
                disabled={busy}
                onClick={() => send(q)}
                className="rounded-full border border-white/12 bg-white/[.04] px-3 py-1.5 text-xs text-haze-200 transition hover:border-prism-cyan/50 hover:bg-white/[.08] hover:text-white disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </motion.div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-3.5 py-2.5 text-[13px] text-rose-200">
            {error}
          </div>
        )}
      </div>

      {/* composer */}
      <div className="shrink-0 border-t border-white/8 p-3 sm:p-4">
        <div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-white/[.09] p-1.5 pl-3.5 transition focus-within:border-prism-cyan/60 focus-within:bg-white/[.13]">
          <textarea
            ref={inputRef}
            value={input}
            rows={1}
            disabled={busy}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-grow up to ~5 lines, then scroll.
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            placeholder={t.chat.placeholder}
            className="max-h-[120px] min-h-[36px] flex-1 resize-none bg-transparent py-2 text-[14px] text-white outline-none placeholder:text-haze-400 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => void send(input)}
            disabled={busy || !input.trim()}
            aria-label={t.chat.send}
            className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-ink-950 transition hover:shadow-[0_8px_24px_-8px_rgba(94,231,255,.9)] disabled:opacity-30"
          >
            <ArrowUp className="size-4" strokeWidth={2.5} />
          </button>
        </div>
        <p className="mt-2 px-1 text-[10.5px] text-haze-400">{t.chat.privacy}</p>
      </div>
    </div>
  );
}
