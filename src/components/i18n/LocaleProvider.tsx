"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type Ctx = { locale: Locale; t: Dictionary };

const LocaleCtx = createContext<Ctx | null>(null);

/**
 * Carries the active locale's copy down to client components.
 *
 * The dictionary is resolved on the server and passed in as a plain object, so
 * only the active language is ever sent to the browser — the other two never
 * reach the bundle.
 */
export default function LocaleProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  return (
    <LocaleCtx.Provider value={{ locale, t: dictionary }}>
      {children}
    </LocaleCtx.Provider>
  );
}

export function useLocale(): Ctx {
  const ctx = useContext(LocaleCtx);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}

/** Shorthand for the common case of only needing the strings. */
export function useT(): Dictionary {
  return useLocale().t;
}
