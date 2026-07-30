export const LOCALES = ["en", "ru", "uz"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_META: Record<
  Locale,
  { label: string; short: string; htmlLang: string }
> = {
  en: { label: "English", short: "EN", htmlLang: "en" },
  ru: { label: "Русский", short: "RU", htmlLang: "ru" },
  uz: { label: "O‘zbekcha", short: "UZ", htmlLang: "uz" },
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * Picks the best locale from an Accept-Language header.
 *
 * Deliberately loose about regional subtags — `ru-RU`, `ru-KZ` and bare `ru`
 * should all land on Russian. Uzbek browsers often send `uz-Latn-UZ`.
 */
export function pickLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      const quality = q ? Number.parseFloat(q.split("=")[1]) : 1;
      return { tag: tag.trim().toLowerCase(), quality: Number.isFinite(quality) ? quality : 0 };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
