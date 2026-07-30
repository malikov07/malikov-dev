import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../globals.css";

// The admin panel is a private tool for one person, so it stays in English and
// carries its own shell rather than living under the localised routes.
export const metadata: Metadata = {
  title: "Admin · Malikov",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#04050a",
  colorScheme: "dark",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="relative flex min-h-full flex-col bg-ink-950">
        {children}
      </body>
    </html>
  );
}
