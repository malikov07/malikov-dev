/**
 * The vocabulary shared by the intake chat, the AI prompt and the admin panel.
 * Everything the client can pick lives here so the three stay in sync.
 */

export type ProjectKind = "website" | "telegram_bot" | "other" | "mobile_app";

export type KindDef = {
  id: ProjectKind;
  label: string;
  tagline: string;
  blurb: string;
  /** Disabled kinds render as "coming soon" and cannot start a chat. */
  available: boolean;
  examples: string[];
};

export const PROJECT_KINDS: KindDef[] = [
  {
    id: "website",
    label: "Website",
    tagline: "Landing pages, stores, dashboards",
    blurb:
      "A site people visit in a browser — from a one-page launch site to a full store with payments and an admin area.",
    available: true,
    examples: ["Landing page", "Online store", "Portfolio", "Booking site", "Web app"],
  },
  {
    id: "telegram_bot",
    label: "Telegram Bot",
    tagline: "Shops, booking, automation",
    blurb:
      "A bot your customers talk to inside Telegram. Takes orders, answers questions, collects payments, notifies you.",
    available: true,
    examples: ["Shop bot", "Booking bot", "Support bot", "Mini App", "Notifier"],
  },
  {
    id: "other",
    label: "Something else",
    tagline: "Scripts, integrations, source code",
    blurb:
      "Automation scripts, API integrations, scrapers, fixing or finishing an existing project, or source code you can build on.",
    available: true,
    examples: ["Automation", "API integration", "Scraper", "Bug fixing", "Source code"],
  },
  {
    id: "mobile_app",
    label: "Mobile App",
    tagline: "iOS & Android",
    blurb:
      "Native and cross-platform mobile apps. Not open for new requests yet — this lands soon.",
    available: false,
    examples: ["iOS", "Android", "React Native"],
  },
];

export const KIND_BY_ID = Object.fromEntries(
  PROJECT_KINDS.map((k) => [k.id, k]),
) as Record<ProjectKind, KindDef>;

/**
 * Ten visual directions the client can choose from. `preview` drives a live
 * CSS mock inside the chat — no image assets, so it stays instant and sharp
 * at any size. Each preview is a pair of layered gradients plus the surface
 * treatment that defines the style.
 */
export type DesignStyle = {
  id: string;
  label: string;
  /** One line, written for a non-designer. */
  description: string;
  preview: {
    /** Page background of the mock. */
    bg: string;
    /** The floating "card" inside the mock. */
    card: string;
    /** Card border. */
    border: string;
    /** Card shadow. */
    shadow: string;
    /** Accent used for the fake button / bars. */
    accent: string;
    /** Colour of the fake text bars. */
    text: string;
    /** Corner radius of the card, in px. */
    radius: number;
    /** Applied to the card — used for frosted styles. */
    blur?: string;
  };
};

export const DESIGN_STYLES: DesignStyle[] = [
  {
    id: "liquid-glass",
    label: "Liquid Glass",
    description: "Glowing see-through panels that bend the light behind them. Like this site.",
    preview: {
      bg: "radial-gradient(120% 120% at 20% 15%, #2a1c5e 0%, #0a0a1f 55%, #05060b 100%)",
      card: "linear-gradient(140deg, rgba(255,255,255,.20), rgba(255,255,255,.04))",
      border: "1px solid rgba(255,255,255,.30)",
      shadow: "0 12px 40px -12px rgba(94,231,255,.55), inset 0 1px 0 rgba(255,255,255,.5)",
      accent: "linear-gradient(90deg, #5ee7ff, #a78bfa, #ff6bd6)",
      text: "rgba(255,255,255,.62)",
      radius: 14,
      blur: "blur(6px)",
    },
  },
  {
    id: "glassmorphism",
    label: "Glassmorphism",
    description: "Frosted glass cards over soft colour. Light, airy and friendly.",
    preview: {
      bg: "linear-gradient(135deg, #ff9de4 0%, #8ab6ff 50%, #7ef0d0 100%)",
      card: "rgba(255,255,255,.28)",
      border: "1px solid rgba(255,255,255,.55)",
      shadow: "0 10px 30px -10px rgba(31,38,135,.45)",
      accent: "linear-gradient(90deg, #ffffff, rgba(255,255,255,.55))",
      text: "rgba(255,255,255,.85)",
      radius: 16,
      blur: "blur(8px)",
    },
  },
  {
    id: "minimalism",
    label: "Minimalism",
    description: "Lots of white space, few elements, calm. Nothing competes for attention.",
    preview: {
      bg: "#fbfbfa",
      card: "#ffffff",
      border: "1px solid #e8e8e4",
      shadow: "0 1px 2px rgba(0,0,0,.05)",
      accent: "#111111",
      text: "#c9c9c4",
      radius: 4,
    },
  },
  {
    id: "neo-brutalism",
    label: "Neo-Brutalism",
    description: "Thick black outlines, hard shadows, loud colour. Bold and memorable.",
    preview: {
      bg: "#ffe94a",
      card: "#ffffff",
      border: "2.5px solid #111111",
      shadow: "5px 5px 0 #111111",
      accent: "#ff5c39",
      text: "#111111",
      radius: 2,
    },
  },
  {
    id: "dark-luxury",
    label: "Dark & Luxury",
    description: "Deep black with gold accents and elegant type. Premium and expensive-looking.",
    preview: {
      bg: "linear-gradient(160deg, #14110c 0%, #0a0908 100%)",
      card: "linear-gradient(150deg, #1e1a12, #141109)",
      border: "1px solid rgba(214,178,102,.42)",
      shadow: "0 10px 34px -14px rgba(214,178,102,.5)",
      accent: "linear-gradient(90deg, #d6b266, #f0dda8)",
      text: "rgba(214,178,102,.42)",
      radius: 6,
    },
  },
  {
    id: "neumorphism",
    label: "Neumorphism",
    description: "Soft shapes that look pressed out of the background. Gentle and tactile.",
    preview: {
      bg: "#e6e9ef",
      card: "#e6e9ef",
      border: "1px solid rgba(255,255,255,.7)",
      shadow: "6px 6px 14px rgba(163,177,198,.6), -6px -6px 14px rgba(255,255,255,.95)",
      accent: "linear-gradient(90deg, #8b9bb4, #aab7cc)",
      text: "rgba(139,155,180,.45)",
      radius: 16,
    },
  },
  {
    id: "bento-grid",
    label: "Bento Grid",
    description: "Everything in neat rounded tiles, like an Apple keynote slide. Very organised.",
    preview: {
      bg: "#0f1115",
      card: "linear-gradient(150deg, #1b1f28, #14171d)",
      border: "1px solid rgba(255,255,255,.10)",
      shadow: "0 8px 26px -12px rgba(0,0,0,.9)",
      accent: "linear-gradient(90deg, #6ee7b7, #38bdf8)",
      text: "rgba(255,255,255,.30)",
      radius: 12,
    },
  },
  {
    id: "3d-immersive",
    label: "3D & Immersive",
    description: "Real depth, floating objects and scenes that move as you scroll. Wow-factor.",
    preview: {
      bg: "radial-gradient(100% 100% at 70% 20%, #1b3a6b 0%, #0a1226 60%, #05070f 100%)",
      card: "linear-gradient(145deg, rgba(120,180,255,.30), rgba(60,90,180,.14))",
      border: "1px solid rgba(150,200,255,.42)",
      shadow: "0 22px 44px -18px rgba(56,132,255,.75), inset 0 1px 0 rgba(255,255,255,.4)",
      accent: "linear-gradient(90deg, #7cc4ff, #c9a6ff)",
      text: "rgba(200,225,255,.5)",
      radius: 14,
    },
  },
  {
    id: "aurora-gradient",
    label: "Aurora Gradient",
    description: "Flowing colourful light in the background. Modern, energetic, startup-like.",
    preview: {
      bg: "linear-gradient(130deg, #7c3aed 0%, #db2777 45%, #f59e0b 100%)",
      card: "rgba(10,6,20,.42)",
      border: "1px solid rgba(255,255,255,.24)",
      shadow: "0 14px 40px -14px rgba(0,0,0,.6)",
      accent: "linear-gradient(90deg, #ffffff, #ffd6f2)",
      text: "rgba(255,255,255,.6)",
      radius: 14,
      blur: "blur(4px)",
    },
  },
  {
    id: "editorial",
    label: "Editorial",
    description: "Big serif headlines and a strong grid, like a fashion magazine. Content-first.",
    preview: {
      bg: "#f5f1e8",
      card: "#ffffff",
      border: "1px solid #1a1a1a",
      shadow: "none",
      accent: "#1a1a1a",
      text: "#b8b2a4",
      radius: 0,
    },
  },
];

export const DESIGN_BY_ID = Object.fromEntries(
  DESIGN_STYLES.map((d) => [d.id, d]),
) as Record<string, DesignStyle>;

export const CONTACT_METHODS = ["telegram", "phone", "email"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

export const STATUSES = [
  "new",
  "accepted",
  "rejected",
  "in_progress",
  "done",
] as const;
export type ProjectStatus = (typeof STATUSES)[number];

export const STATUS_META: Record<
  ProjectStatus,
  { label: string; tone: string; dot: string }
> = {
  new: { label: "New", tone: "text-sky-200 bg-sky-400/10 border-sky-300/25", dot: "bg-sky-300" },
  accepted: {
    label: "Accepted",
    tone: "text-emerald-200 bg-emerald-400/10 border-emerald-300/25",
    dot: "bg-emerald-300",
  },
  rejected: {
    label: "Rejected",
    tone: "text-rose-200 bg-rose-400/10 border-rose-300/25",
    dot: "bg-rose-300",
  },
  in_progress: {
    label: "In progress",
    tone: "text-amber-200 bg-amber-400/10 border-amber-300/25",
    dot: "bg-amber-300",
  },
  done: {
    label: "Done",
    tone: "text-violet-200 bg-violet-400/10 border-violet-300/25",
    dot: "bg-violet-300",
  },
};

/** Human-friendly reference, e.g. "MD-7K2Q". Ambiguous glyphs removed. */
export function makeRef(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 4; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `MD-${out}`;
}
