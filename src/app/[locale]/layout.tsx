import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope, Unbounded } from "next/font/google";
import { notFound } from "next/navigation";
import LocaleProvider from "@/components/i18n/LocaleProvider";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "@/lib/i18n/config";
import "../globals.css";

// Headlines: Unbounded — wide, round and heavy, set very large. Body: Manrope.
// Both carry Cyrillic, which Russian needs; Uzbek is Latin. The italic serif
// is only for the accent words, and is Latin-only, so Russian accents fall
// back to the next serif in --font-display.
const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
});

// Feeds metadataBase, the canonical URL and every hreflang tag. A wrong value
// here is worse than a missing one: it tells search engines the real copy of
// this page lives on a domain that is not this site. Overridable so preview
// deploys do not advertise themselves as the production URL.
// `||` rather than `??`: the variable is present-but-empty in .env.example, and
// an empty string would reach `new URL("")` and throw during the build.
const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://it-network.uz"
).replace(/\/$/, "");

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);

  return {
    metadataBase: new URL(SITE),
    title: { default: t.meta.title, template: "%s · IT-Network" },
    description: t.meta.description,
    alternates: {
      canonical: `${SITE}/${locale}`,
      // hreflang, so each language surfaces for the right audience instead of
      // the three competing as duplicates. `x-default` is the one a search
      // engine shows a visitor it cannot match to any of them, and it has to
      // agree with where the redirect actually sends that visitor.
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, `${SITE}/${l}`])),
        "x-default": `${SITE}/${DEFAULT_LOCALE}`,
      } as Record<string, string>,
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.ogDescription,
      url: `${SITE}/${locale}`,
      siteName: "IT-Network",
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.ogDescription,
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#070b1d",
  colorScheme: "dark",
};

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = getDictionary(locale as Locale);

  return (
    <html
      lang={locale}
      className={`${instrument.variable} ${unbounded.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="grain relative flex min-h-full flex-col bg-ink-950">
        <LocaleProvider locale={locale as Locale} dictionary={dictionary}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
