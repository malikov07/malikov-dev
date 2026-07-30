import { z } from "zod";
import { CONTACT_METHODS, DESIGN_STYLES } from "./catalog";

export const PROJECT_KIND_VALUES = [
  "website",
  "telegram_bot",
  "other",
  "mobile_app",
] as const;

/**
 * Everything the intake conversation is trying to learn. Every field is
 * optional: the AI fills them in as they come up, and the client merges each
 * turn's `notes` on top of what it already has.
 */
export const briefSchema = z.object({
  title: z.string().max(120).optional(),
  summary: z.string().max(2000).optional(),
  kind: z.enum(PROJECT_KIND_VALUES).optional(),
  designStyle: z
    .enum(DESIGN_STYLES.map((d) => d.id) as [string, ...string[]])
    .optional(),
  features: z.array(z.string().max(200)).max(30).optional(),
  scope: z.array(z.string().max(200)).max(40).optional(),
  audience: z.string().max(300).optional(),
  languages: z.array(z.string().max(40)).max(10).optional(),
  references: z.string().max(600).optional(),
  timeline: z.string().max(200).optional(),

  contactName: z.string().max(120).optional(),
  contactMethod: z.enum(CONTACT_METHODS).optional(),
  contactValue: z.string().max(200).optional(),
  availability: z.string().max(300).optional(),
  timezone: z.string().max(80).optional(),

  budgetText: z.string().max(300).optional(),
  budgetMin: z.number().int().nonnegative().max(10_000_000).optional(),
  budgetMax: z.number().int().nonnegative().max(10_000_000).optional(),
  budgetCurrency: z.string().max(8).optional(),
  budgetUnknown: z.boolean().optional(),
});

export type Brief = z.infer<typeof briefSchema>;

export const STAGES = [
  "discovery",
  "design",
  "details",
  "contact",
  "budget",
  "review",
  "complete",
] as const;
export type Stage = (typeof STAGES)[number];

/**
 * The shape the model must return every turn. `ui` lets the model drive the
 * chat interface — opening the design gallery or offering tappable answers —
 * so the client never has to guess what widget to show.
 */
export const assistantTurnSchema = z.object({
  reply: z.string().min(1).max(1600),
  notes: briefSchema.default({}),
  stage: z.enum(STAGES).default("discovery"),
  ui: z
    .object({
      designPicker: z.boolean().optional(),
      quickReplies: z.array(z.string().max(48)).max(5).optional(),
      /** Renders the contact form inline instead of free text. */
      contactForm: z.boolean().optional(),
      /** Renders budget chips plus an "I don't know" escape hatch. */
      budgetPicker: z.boolean().optional(),
      /** Renders the read-back summary card with a confirm button. */
      summary: z.boolean().optional(),
    })
    .default({}),
  /** True only when the brief is complete and confirmed — triggers submit. */
  done: z.boolean().default(false),
});

export type AssistantTurn = z.infer<typeof assistantTurnSchema>;

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(6000),
  at: z.number().optional(),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatRequestSchema = z.object({
  kind: z.enum(PROJECT_KIND_VALUES),
  messages: z.array(chatMessageSchema).max(80),
  brief: briefSchema.default({}),
  locale: z.enum(["en", "ru", "uz"]).default("en"),
});

export const submitRequestSchema = z.object({
  kind: z.enum(PROJECT_KIND_VALUES),
  brief: briefSchema,
  messages: z.array(chatMessageSchema).max(80),
  locale: z.string().max(20).optional(),
  /** Anti-spam: a hidden field real users never fill in. */
  website: z.string().max(0).optional(),
});

/** Shape returned to the admin panel. */
export type AdminProject = {
  id: string;
  ref: string;
  kind: string;
  title: string;
  summary: string;
  designStyle: string | null;
  features: string[];
  scope: string[];
  audience: string | null;
  languages: string[];
  references: string | null;
  timeline: string | null;
  contactName: string;
  contactMethod: string;
  contactValue: string;
  availability: string;
  timezone: string | null;
  budgetText: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetCurrency: string;
  budgetUnknown: boolean;
  status: string;
  adminComment: string | null;
  adminNotes: string | null;
  decidedAt: string | null;
  transcript: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  events: {
    id: string;
    type: string;
    fromStatus: string | null;
    toStatus: string | null;
    comment: string | null;
    createdAt: string;
  }[];
};
