"use client";

import { motion } from "motion/react";
import { CircleHelp, Clock, Mail, Phone, Send } from "lucide-react";
import { useState } from "react";
import { DESIGN_BY_ID, type ContactMethod, type ProjectKind } from "@/lib/catalog";
import { useLocale, useT } from "@/components/i18n/LocaleProvider";
import { fill } from "@/lib/i18n";
import { styleCopy } from "@/lib/i18n/styles";
import type { Brief } from "@/lib/types";
import StylePreview from "./StylePreview";

const FIELD =
  "w-full rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-2.5 text-sm " +
  "text-white outline-none transition placeholder:text-haze-400 " +
  "focus:border-prism-cyan/60 focus:bg-white/[.07]";

const CHIP =
  "rounded-full border px-3 py-1.5 text-xs transition select-none";
const CHIP_OFF = "border-white/10 bg-white/[.04] text-haze-300 hover:border-white/25 hover:text-white";
const CHIP_ON = "border-prism-cyan/60 bg-prism-cyan/15 text-white";

const METHOD_ICONS: Record<ContactMethod, typeof Send> = {
  telegram: Send,
  phone: Phone,
  email: Mail,
};

const METHOD_PLACEHOLDERS: Record<ContactMethod, string> = {
  telegram: "@username",
  phone: "+998 90 123 45 67",
  email: "you@example.com",
};

/** Name + how to reach them + when they're free, in one pass. */
export function ContactForm({
  onSubmit,
  disabled,
}: {
  onSubmit: (patch: Brief, echo: string) => void;
  disabled?: boolean;
}) {
  const t = useT();
  const methods: { id: ContactMethod; label: string }[] = [
    { id: "telegram", label: t.contact.telegram },
    { id: "phone", label: t.contact.phone },
    { id: "email", label: t.contact.email },
  ];
  const slots = t.contact.slots;

  const [name, setName] = useState("");
  const [method, setMethod] = useState<ContactMethod>("phone");
  const [value, setValue] = useState("");
  const [slot, setSlot] = useState(slots[0]);
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);

  const active = methods.find((m) => m.id === method)!;
  const valid = name.trim().length > 1 && value.trim().length > 2;

  const submit = () => {
    setTouched(true);
    if (!valid || disabled) return;

    // slots[0] is the "anytime" option in every language.
    const availability =
      slot === slots[0] && !note.trim()
        ? t.contact.anytime
        : [slot, note.trim()].filter(Boolean).join(" — ");

    onSubmit(
      {
        contactName: name.trim(),
        contactMethod: method,
        contactValue: value.trim(),
        availability,
        timezone:
          Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
      },
      fill(t.contact.echo, {
        name: name.trim(),
        method: active.label,
        value: value.trim(),
        availability,
      }),
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 space-y-3 rounded-2xl border border-white/10 bg-white/[.03] p-4"
    >
      <div>
        <label className="mb-1.5 block text-xs font-medium text-haze-200">
          {t.contact.name}
        </label>
        <input
          className={FIELD}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.contact.namePlaceholder}
          autoComplete="name"
          disabled={disabled}
        />
        {touched && name.trim().length < 2 && (
          <p className="mt-1 text-[11px] text-rose-300">{t.contact.nameError}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-haze-200">
          {t.contact.method}
        </label>
        <div className="mb-2 flex gap-1.5">
          {methods.map((m) => {
            const Icon = METHOD_ICONS[m.id];
            const on = m.id === method;
            return (
              <button
                key={m.id}
                type="button"
                disabled={disabled}
                onClick={() => setMethod(m.id)}
                className={`${CHIP} inline-flex items-center gap-1.5 ${on ? CHIP_ON : CHIP_OFF}`}
              >
                <Icon className="size-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>
        <input
          className={FIELD}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={METHOD_PLACEHOLDERS[method]}
          inputMode={method === "phone" ? "tel" : "text"}
          autoComplete={method === "email" ? "email" : method === "phone" ? "tel" : "off"}
          disabled={disabled}
        />
        {touched && value.trim().length < 3 && (
          <p className="mt-1 text-[11px] text-rose-300">
            {fill(t.contact.valueError, { method: active.label })}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-haze-200">
          <Clock className="size-3.5" />
          {t.contact.when}
        </label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {slots.map((s) => (
            <button
              key={s}
              type="button"
              disabled={disabled}
              onClick={() => setSlot(s)}
              className={`${CHIP} ${s === slot ? CHIP_ON : CHIP_OFF}`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          className={FIELD}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t.contact.exactPlaceholder}
          disabled={disabled}
        />
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={disabled}
        className="w-full rounded-xl bg-white py-2.5 text-sm font-medium text-ink-950 transition hover:shadow-[0_10px_30px_-10px_rgba(94,231,255,.8)] disabled:opacity-50"
      >
        {t.contact.continue}
      </button>
    </motion.div>
  );
}

const CURRENCIES = ["USD", "UZS", "EUR", "RUB"];

// Scaled for small, quick-turnaround work. These bands are suggestions, not a
// price list — they mainly exist so a client who has no figure in mind has
// something to point at. The lowest band is deliberately first and cheap, so
// nobody with a small job assumes they're in the wrong place.
const BANDS: Record<string, { label: string; min: number; max: number }[]> = {
  USD: [
    { label: "Under $50", min: 0, max: 50 },
    { label: "$50 – $120", min: 50, max: 120 },
    { label: "$120 – $300", min: 120, max: 300 },
    { label: "$300 – $600", min: 300, max: 600 },
    { label: "$600+", min: 600, max: 600 },
  ],
  UZS: [
    { label: "Under 600k", min: 0, max: 600_000 },
    { label: "600k – 1.5M", min: 600_000, max: 1_500_000 },
    { label: "1.5M – 3.5M", min: 1_500_000, max: 3_500_000 },
    { label: "3.5M – 7M", min: 3_500_000, max: 7_000_000 },
    { label: "7M+", min: 7_000_000, max: 7_000_000 },
  ],
  EUR: [
    { label: "Under €50", min: 0, max: 50 },
    { label: "€50 – €120", min: 50, max: 120 },
    { label: "€120 – €280", min: 120, max: 280 },
    { label: "€280 – €550", min: 280, max: 550 },
    { label: "€550+", min: 550, max: 550 },
  ],
  RUB: [
    { label: "Under 5k", min: 0, max: 5_000 },
    { label: "5k – 12k", min: 5_000, max: 12_000 },
    { label: "12k – 28k", min: 12_000, max: 28_000 },
    { label: "28k – 55k", min: 28_000, max: 55_000 },
    { label: "55k+", min: 55_000, max: 55_000 },
  ],
};

/** Budget, with a first-class "no idea" answer — never recorded as zero. */
export function BudgetPicker({
  onSubmit,
  disabled,
}: {
  onSubmit: (patch: Brief, echo: string) => void;
  disabled?: boolean;
}) {
  const t = useT();
  const [currency, setCurrency] = useState("USD");
  const [custom, setCustom] = useState("");

  const bands = BANDS[currency] ?? BANDS.USD;

  const pickBand = (band: { label: string; min: number; max: number }) => {
    if (disabled) return;
    onSubmit(
      {
        budgetMin: band.min,
        budgetMax: band.max,
        budgetCurrency: currency,
        budgetText: band.label,
        budgetUnknown: false,
      },
      fill(t.budget.bandEcho, { band: band.label }),
    );
  };

  const submitCustom = () => {
    const text = custom.trim();
    if (!text || disabled) return;
    // Pull the numbers out if they typed any, but always keep their words.
    const nums = text.match(/\d[\d\s,.]*/g)?.map((n) => Number(n.replace(/[\s,.]/g, ""))) ?? [];
    const valid = nums.filter((n) => Number.isFinite(n) && n > 0);
    onSubmit(
      {
        budgetText: text,
        budgetCurrency: currency,
        budgetMin: valid.length ? Math.min(...valid) : undefined,
        budgetMax: valid.length ? Math.max(...valid) : undefined,
        budgetUnknown: false,
      },
      text,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 space-y-3 rounded-2xl border border-white/10 bg-white/[.03] p-4"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs text-haze-300">{t.budget.currency}</span>
        {CURRENCIES.map((c) => (
          <button
            key={c}
            type="button"
            disabled={disabled}
            onClick={() => setCurrency(c)}
            className={`${CHIP} ${c === currency ? CHIP_ON : CHIP_OFF}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {bands.map((b) => (
          <button
            key={b.label}
            type="button"
            disabled={disabled}
            onClick={() => pickBand(b)}
            className={`${CHIP} ${CHIP_OFF}`}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className={FIELD}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitCustom()}
          placeholder={t.budget.customPlaceholder}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={submitCustom}
          disabled={disabled || !custom.trim()}
          className="shrink-0 rounded-xl bg-white px-4 text-sm font-medium text-ink-950 transition disabled:opacity-40"
        >
          {t.budget.send}
        </button>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          onSubmit(
            { budgetUnknown: true, budgetText: t.budget.dontKnowNote },
            t.budget.dontKnowEcho,
          )
        }
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[.04] py-2.5 text-sm text-haze-200 transition hover:border-white/25 hover:text-white disabled:opacity-50"
      >
        <CircleHelp className="size-4" />
        {t.budget.dontKnow}
      </button>
    </motion.div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[86px_1fr] gap-3 py-1.5">
      <dt className="text-[11px] uppercase tracking-wider text-haze-400">{label}</dt>
      <dd className="min-w-0 text-[13px] leading-relaxed text-haze-100">{children}</dd>
    </div>
  );
}

/** Read-back card shown before anything is saved. */
export function SummaryCard({
  kind,
  brief,
  onConfirm,
  onEdit,
  busy,
}: {
  kind: ProjectKind;
  brief: Brief;
  onConfirm: () => void;
  onEdit: () => void;
  busy?: boolean;
}) {
  const { locale, t } = useLocale();
  const style = brief.designStyle ? DESIGN_BY_ID[brief.designStyle] : undefined;
  const styleLabel = style ? (styleCopy(locale, style.id)?.label ?? style.label) : "";

  const budget = brief.budgetUnknown
    ? t.summary.budgetUnknown
    : brief.budgetMin != null && brief.budgetMax != null
      ? brief.budgetMin === brief.budgetMax
        ? `${brief.budgetMin.toLocaleString("en-US")} ${brief.budgetCurrency ?? "USD"}`
        : `${brief.budgetMin.toLocaleString("en-US")}–${brief.budgetMax.toLocaleString("en-US")} ${brief.budgetCurrency ?? "USD"}`
      : brief.budgetText || t.summary.budgetNone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 overflow-hidden rounded-2xl border border-white/12 bg-white/[.03]"
    >
      <div className="flex items-center justify-between border-b border-white/8 bg-white/[.03] px-4 py-2.5">
        <span className="text-xs font-medium uppercase tracking-wider text-haze-200">
          {t.summary.heading}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10.5px] text-haze-300">
          {t.kinds[kind].label}
        </span>
      </div>

      <div className="flex gap-4 p-4">
        <dl className="min-w-0 flex-1 divide-y divide-white/5">
          {brief.title && <Row label={t.summary.project}>{brief.title}</Row>}
          {brief.summary && <Row label={t.summary.about}>{brief.summary}</Row>}
          {!!brief.features?.length && (
            <Row label={t.summary.features}>
              <ul className="space-y-0.5">
                {brief.features.slice(0, 8).map((f) => (
                  <li key={f} className="flex gap-1.5">
                    <span className="mt-[7px] size-1 shrink-0 rounded-full bg-prism-cyan" />
                    {f}
                  </li>
                ))}
              </ul>
            </Row>
          )}
          {!!brief.scope?.length && (
            <Row label={t.summary.scope}>{brief.scope.slice(0, 10).join(" · ")}</Row>
          )}
          {style && <Row label={t.summary.style}>{styleLabel}</Row>}
          {brief.audience && <Row label={t.summary.audience}>{brief.audience}</Row>}
          {!!brief.languages?.length && (
            <Row label={t.summary.languages}>
              {brief.languages.join(", ").toUpperCase()}
            </Row>
          )}
          {brief.timeline && <Row label={t.summary.timing}>{brief.timeline}</Row>}
          {brief.references && <Row label={t.summary.likes}>{brief.references}</Row>}
          {brief.contactName && (
            <Row label={t.summary.contact}>
              {brief.contactName} · {brief.contactValue}
              <span className="block text-haze-400">
                {t.summary.free}: {brief.availability || t.contact.anytime}
              </span>
            </Row>
          )}
          <Row label={t.summary.budget}>{budget}</Row>
        </dl>

        {style && (
          <div className="hidden w-[128px] shrink-0 sm:block">
            <div className="overflow-hidden rounded-lg border border-white/12">
              <StylePreview style={style} className="h-[86px]" />
            </div>
            <p className="mt-1.5 text-center text-[10px] text-haze-400">
              {styleLabel}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t border-white/8 p-3">
        <button
          type="button"
          onClick={onEdit}
          disabled={busy}
          className="flex-1 rounded-xl border border-white/10 bg-white/[.04] py-2.5 text-sm text-haze-200 transition hover:border-white/25 hover:text-white disabled:opacity-50"
        >
          {t.summary.edit}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="flex-[1.4] rounded-xl bg-white py-2.5 text-sm font-medium text-ink-950 transition hover:shadow-[0_10px_30px_-10px_rgba(94,231,255,.8)] disabled:opacity-50"
        >
          {busy ? t.summary.sending : t.summary.confirm}
        </button>
      </div>
    </motion.div>
  );
}
