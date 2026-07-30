"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useT } from "@/components/i18n/LocaleProvider";
import { Reveal } from "@/components/ui/Reveal";
import Section from "./Section";

function Item({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`glass overflow-hidden rounded-2xl transition-colors duration-500 ${
        open ? "border-white/22" : "hover:border-white/18"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
      >
        <span className="flex-1 text-[15px] font-medium tracking-tight text-white sm:text-base">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="grid size-7 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[.05] text-haze-200"
        >
          <Plus className="size-3.5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-[14px] leading-relaxed text-haze-300 sm:px-6 sm:pb-6">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  const t = useT();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section
      id="faq"
      eyebrow={t.faq.eyebrow}
      title={t.faq.title}
      accent={t.faq.accent}
    >
      <div className="mx-auto max-w-3xl space-y-2.5">
        {t.faq.items.map((f, i) => (
          <Reveal key={f.q} delay={i * 0.05}>
            <Item
              q={f.q}
              a={f.a}
              open={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
