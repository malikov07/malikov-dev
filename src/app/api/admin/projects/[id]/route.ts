import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthed } from "@/lib/auth";
import { STATUSES } from "@/lib/catalog";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("decide"),
    status: z.enum(["accepted", "rejected"]),
    /** Shown to the client alongside the decision. */
    comment: z.string().max(4000).optional(),
  }),
  z.object({
    action: z.literal("status"),
    status: z.enum(STATUSES),
    comment: z.string().max(4000).optional(),
  }),
  z.object({
    action: z.literal("notes"),
    adminNotes: z.string().max(8000),
  }),
]);

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const existing = await prisma.projectRequest.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = parsed.data;

  if (body.action === "notes") {
    await prisma.projectRequest.update({
      where: { id },
      data: { adminNotes: body.adminNotes },
    });
    return NextResponse.json({ ok: true });
  }

  const nextStatus = body.status;
  const comment = body.comment?.trim() || null;

  // The decision comment is the message that goes with accept/reject, so it
  // replaces adminComment. A later status bump keeps the original unless a
  // new comment is supplied.
  await prisma.$transaction([
    prisma.projectRequest.update({
      where: { id },
      data: {
        status: nextStatus,
        ...(comment !== null ? { adminComment: comment } : {}),
        ...(body.action === "decide" ? { decidedAt: new Date() } : {}),
      },
    }),
    prisma.projectEvent.create({
      data: {
        projectId: id,
        type: "status_change",
        fromStatus: existing.status,
        toStatus: nextStatus,
        comment,
        author: "admin",
      },
    }),
  ]);

  return NextResponse.json({ ok: true, status: nextStatus });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await prisma.projectRequest.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
