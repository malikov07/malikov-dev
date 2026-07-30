import { NextResponse } from "next/server";
import { makeRef } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { notifyNewRequest } from "@/lib/notify";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { submitRequestSchema } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function describeBudget(b: {
  budgetUnknown?: boolean;
  budgetMin?: number;
  budgetMax?: number;
  budgetCurrency?: string;
  budgetText?: string;
}): string {
  if (b.budgetUnknown) return "Not sure yet";
  const cur = b.budgetCurrency ?? "USD";
  if (b.budgetMin != null && b.budgetMax != null) {
    return b.budgetMin === b.budgetMax
      ? `${b.budgetMin} ${cur}`
      : `${b.budgetMin}–${b.budgetMax} ${cur}`;
  }
  if (b.budgetMin != null) return `${b.budgetMin}+ ${cur}`;
  return b.budgetText?.slice(0, 80) ?? "Not stated";
}

export async function POST(req: Request) {
  const limited = rateLimit(`submit:${clientKey(req)}`, 5, 60 * 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "You've sent several requests already. Try again later." },
      { status: 429 },
    );
  }

  const parsed = submitRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Some details are missing.", issues: parsed.error.issues.slice(0, 5) },
      { status: 400 },
    );
  }

  const { kind, brief, messages, locale, website } = parsed.data;

  // Honeypot — bots fill every field they find.
  if (website) return NextResponse.json({ ok: true, ref: makeRef() });

  if (kind === "mobile_app") {
    return NextResponse.json(
      { error: "Mobile app requests are not open yet." },
      { status: 400 },
    );
  }
  if (!brief.contactName || !brief.contactValue) {
    return NextResponse.json(
      { error: "We still need a name and a way to reach you." },
      { status: 400 },
    );
  }

  // `ref` is unique and short enough to collide occasionally; retry rather
  // than failing a real submission.
  for (let attempt = 0; attempt < 5; attempt++) {
    const ref = makeRef();
    try {
      const created = await prisma.projectRequest.create({
        data: {
          ref,
          kind,
          title: brief.title?.slice(0, 120) || "Untitled project",
          summary: brief.summary || "(no summary captured)",
          designStyle: brief.designStyle ?? null,
          features: JSON.stringify(brief.features ?? []),
          scope: JSON.stringify(brief.scope ?? []),
          audience: brief.audience ?? null,
          languages: JSON.stringify(brief.languages ?? []),
          references: brief.references ?? null,
          timeline: brief.timeline ?? null,
          brief: JSON.stringify(brief),

          contactName: brief.contactName,
          contactMethod: brief.contactMethod ?? "telegram",
          contactValue: brief.contactValue,
          availability: brief.availability || "anytime",
          timezone: brief.timezone ?? null,

          budgetText: brief.budgetText ?? null,
          budgetMin: brief.budgetMin ?? null,
          budgetMax: brief.budgetMax ?? null,
          budgetCurrency: brief.budgetCurrency ?? "USD",
          budgetUnknown: brief.budgetUnknown ?? false,

          transcript: JSON.stringify(messages),
          locale: locale ?? null,

          events: {
            create: { type: "created", toStatus: "new", author: "client" },
          },
        },
        select: { id: true, ref: true, title: true, contactName: true, contactValue: true },
      });

      // Fire and forget — the client shouldn't wait on Telegram.
      void notifyNewRequest({
        ref: created.ref,
        kind,
        title: created.title,
        contactName: created.contactName,
        contactValue: created.contactValue,
        budget: describeBudget(brief),
      });

      return NextResponse.json({ ok: true, ref: created.ref });
    } catch (err) {
      const isUniqueClash =
        typeof err === "object" &&
        err !== null &&
        (err as { code?: string }).code === "P2002";
      if (!isUniqueClash) {
        console.error("[requests] create failed:", err);
        return NextResponse.json(
          { error: "Could not save your request. Please try again." },
          { status: 500 },
        );
      }
    }
  }

  return NextResponse.json(
    { error: "Could not save your request. Please try again." },
    { status: 500 },
  );
}
