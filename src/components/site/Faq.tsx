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
    <div className="border-b border-ink/10">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group flex w-full items-center gap-6 py-6 text-left sm:py-7"
      >
        <span className="flex-1 text-[18px] font-semibold tracking-[-0.02em] text-ink sm:text-[22px]">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={`grid size-10 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
            open
              ? "border-ink bg-ink text-white"
              : "border-ink/15 text-ink group-hover:border-ink"
          }`}
        >
          <Plus className="size-4" />
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
            <p className="max-w-2xl pb-7 pr-16 text-[16px] leading-relaxed text-ink-2">{a}</p>
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
      <div className="border-t border-ink/10">
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
