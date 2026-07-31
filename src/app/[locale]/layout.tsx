import type { Metadata, Viewport } from "next";
import { Instrument_Serif } from "next/font/google";
import { notFound } from "next/navigation";
import LocaleProvider from "@/components/i18n/LocaleProvider";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "@/lib/i18n/config";
import "../globals.css";

// Body text uses the Apple system stack (see --font-sans in globals.css), so
// there is no sans webfont to load. Only the display serif is fetched, and it
// is used purely for Latin italic accents.
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
  process.env.NEXT_PUBLIC_SITE_URL || "https://malikov-dev.uz"
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
    title: { default: t.meta.title, template: "%s · Malikov" },
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
      siteName: "Malikov",
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
  themeColor: "#04050a",
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
      // Tells Next the smooth scrolling in globals.css is deliberate, so it
      // suppresses it during route transitions instead of warning about it.
      data-scroll-behavior="smooth"
      className={`${instrument.variable} h-full antialiased`}
    >
      <body className="grain relative flex min-h-full flex-col bg-ink-950">
        <LocaleProvider locale={locale as Locale} dictionary={dictionary}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
