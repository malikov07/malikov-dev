import type { AdminProject, ChatMessage } from "./types";

/** SQLite has no arrays, so list fields are stored as JSON strings. */
function parseArray(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function parseTranscript(value: string): ChatMessage[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is ChatMessage =>
        typeof m === "object" &&
        m !== null &&
        (("role" in m && (m.role === "user" || m.role === "assistant")) as boolean) &&
        "content" in m &&
        typeof (m as { content: unknown }).content === "string",
    );
  } catch {
    return [];
  }
}

type Row = {
  id: string;
  ref: string;
  kind: string;
  title: string;
  summary: string;
  designStyle: string | null;
  features: string;
  scope: string;
  audience: string | null;
  languages: string;
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
  decidedAt: Date | null;
  transcript: string;
  createdAt: Date;
  updatedAt: Date;
  events: {
    id: string;
    type: string;
    fromStatus: string | null;
    toStatus: string | null;
    comment: string | null;
    createdAt: Date;
  }[];
};

/** Prisma row -> plain JSON safe to hand to a client component. */
export function toAdminProject(row: Row): AdminProject {
  return {
    id: row.id,
    ref: row.ref,
    kind: row.kind,
    title: row.title,
    summary: row.summary,
    designStyle: row.designStyle,
    features: parseArray(row.features),
    scope: parseArray(row.scope),
    audience: row.audience,
    languages: parseArray(row.languages),
    references: row.references,
    timeline: row.timeline,
    contactName: row.contactName,
    contactMethod: row.contactMethod,
    contactValue: row.contactValue,
    availability: row.availability,
    timezone: row.timezone,
    budgetText: row.budgetText,
    budgetMin: row.budgetMin,
    budgetMax: row.budgetMax,
    budgetCurrency: row.budgetCurrency,
    budgetUnknown: row.budgetUnknown,
    status: row.status,
    adminComment: row.adminComment,
    adminNotes: row.adminNotes,
    decidedAt: row.decidedAt?.toISOString() ?? null,
    transcript: parseTranscript(row.transcript),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    events: row.events.map((e) => ({
      id: e.id,
      type: e.type,
      fromStatus: e.fromStatus,
      toStatus: e.toStatus,
      comment: e.comment,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}
