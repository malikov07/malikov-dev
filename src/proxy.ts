import { NextResponse, type NextRequest } from "next/server";
import { isLocale, LOCALES, pickLocale } from "@/lib/i18n/config";

const LOCALE_COOKIE = "md_locale";

/**
 * Sends bare paths to a language.
 *
 * Order of preference: a locale the visitor picked before (cookie), then the
 * browser's Accept-Language, then English. Once redirected, the URL carries
 * the locale, so nothing downstream has to guess.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  const saved = req.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(saved)
    ? saved
    : pickLocale(req.headers.get("accept-language"));

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except the admin panel, API routes, Next internals and files
  // with an extension (icons, images, robots.txt).
  matcher: ["/((?!admin|api|_next|.*\\..*).*)"],
};
