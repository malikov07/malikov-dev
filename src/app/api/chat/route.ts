import { NextResponse } from "next/server";
import { scriptedTurn } from "@/lib/ai/fallback";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { generateJson, hasAI, type LlmMessage } from "@/lib/ai/provider";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { assistantTurnSchema, chatRequestSchema, type AssistantTurn } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const limited = rateLimit(`chat:${clientKey(req)}`, 40, 5 * 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many messages. Give it a minute." },
      { status: 429, headers: { "retry-after": String(limited.retryAfter) } },
    );
  }

  const parsed = chatRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const { kind, messages, brief, locale } = parsed.data;

  if (kind === "mobile_app") {
    return NextResponse.json(
      { error: "Mobile app requests are not open yet." },
      { status: 400 },
    );
  }

  if (!hasAI()) {
    return NextResponse.json({
      turn: scriptedTurn(kind, messages, brief, locale),
      mode: "scripted",
    });
  }

  // Give the model the brief so far; without it, it re-asks answered questions
  // as the transcript grows and gets truncated.
  const llmMessages: LlmMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  llmMessages.push({
    role: "user",
    content:
      `[system note, not from the client] Brief so far: ${JSON.stringify(brief)}. ` +
      `Continue from here. Do not re-ask anything already filled in. Reply with the JSON object only.`,
  });

  try {
    const raw = await generateJson(buildSystemPrompt(kind, locale), llmMessages);
    const turn = assistantTurnSchema.safeParse(raw);

    if (!turn.success) {
      // The model answered but off-schema. Salvage the prose if there is any,
      // otherwise hand over to the scripted flow.
      const reply =
        typeof (raw as { reply?: unknown })?.reply === "string"
          ? ((raw as { reply: string }).reply)
          : null;
      if (reply) {
        const salvaged: AssistantTurn = {
          reply,
          notes: {},
          stage: "discovery",
          ui: {},
          done: false,
        };
        return NextResponse.json({ turn: salvaged, mode: "ai" });
      }
      return NextResponse.json({
        turn: scriptedTurn(kind, messages, brief),
        mode: "scripted",
      });
    }

    return NextResponse.json({ turn: turn.data, mode: "ai" });
  } catch (err) {
    console.error("[chat] provider error:", err);
    // Never dead-end the client because a provider blipped.
    return NextResponse.json({
      turn: scriptedTurn(kind, messages, brief, locale),
      mode: "scripted",
    });
  }
}
