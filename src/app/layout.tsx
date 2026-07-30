import type { ReactNode } from "react";

/**
 * Pass-through root.
 *
 * `<html>` and `<body>` live in the segment layouts instead — `[locale]` needs
 * to set `lang` per language, and `/admin` is a separate, English-only shell.
 * A root layout that owned those tags could not do either, because it cannot
 * read a child segment's params.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
