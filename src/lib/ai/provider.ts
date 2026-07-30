/**
 * A thin, dependency-free bridge to whichever LLM the deployment has a key
 * for. Every provider is normalised down to one call: give it a system prompt
 * and a transcript, get back a JSON object.
 *
 * Adding a provider means adding one branch — nothing else in the app knows
 * or cares which model answered.
 */

export type ProviderId = "gemini" | "openai" | "anthropic";

export type ResolvedProvider = {
  id: ProviderId;
  model: string;
  apiKey: string;
};

const DEFAULT_MODELS: Record<ProviderId, string> = {
  gemini: "gemini-2.5-flash",
  openai: "gpt-4o-mini",
  anthropic: "claude-sonnet-5",
};

function clean(value: string | undefined): string {
  return (value ?? "").trim();
}

/**
 * Picks a provider from the environment. An explicit AI_PROVIDER wins;
 * otherwise the first key present, cheapest-first.
 */
export function resolveProvider(): ResolvedProvider | null {
  const forced = clean(process.env.AI_PROVIDER).toLowerCase() as ProviderId | "";
  const keys: Record<ProviderId, string> = {
    gemini: clean(process.env.GEMINI_API_KEY),
    openai: clean(process.env.OPENAI_API_KEY),
    anthropic: clean(process.env.ANTHROPIC_API_KEY),
  };

  const order: ProviderId[] =
    forced && forced in keys
      ? [forced as ProviderId]
      : ["gemini", "openai", "anthropic"];

  for (const id of order) {
    if (keys[id]) {
      return {
        id,
        model: clean(process.env.AI_MODEL) || DEFAULT_MODELS[id],
        apiKey: keys[id],
      };
    }
  }
  return null;
}

export function hasAI(): boolean {
  return resolveProvider() !== null;
}

export type LlmMessage = { role: "user" | "assistant"; content: string };

/**
 * Models wrap JSON in prose or code fences often enough that trusting
 * `JSON.parse` on the raw string is not viable. Take the outermost braces.
 */
function extractJson(raw: string): unknown {
  const text = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new Error("Model did not return JSON");
  }
}

async function post(url: string, init: RequestInit): Promise<Response> {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(45_000) });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `AI request failed (${res.status}): ${body.slice(0, 400) || res.statusText}`,
    );
  }
  return res;
}

async function callGemini(
  p: ResolvedProvider,
  system: string,
  messages: LlmMessage[],
): Promise<unknown> {
  const res = await post(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      p.model,
    )}:generateContent`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": p.apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.65,
          maxOutputTokens: 1600,
        },
      }),
    },
  );

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.map((x) => x.text ?? "").join("");
  if (!text) throw new Error("Empty response from Gemini");
  return extractJson(text);
}

async function callOpenAI(
  p: ResolvedProvider,
  system: string,
  messages: LlmMessage[],
): Promise<unknown> {
  const res = await post("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${p.apiKey}`,
    },
    body: JSON.stringify({
      model: p.model,
      messages: [{ role: "system", content: system }, ...messages],
      response_format: { type: "json_object" },
      temperature: 0.65,
      max_tokens: 1600,
    }),
  });

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from OpenAI");
  return extractJson(text);
}

async function callAnthropic(
  p: ResolvedProvider,
  system: string,
  messages: LlmMessage[],
): Promise<unknown> {
  // No JSON mode here, so prefill the assistant turn with an opening brace —
  // the model can then only continue as a JSON object.
  const res = await post("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": p.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: p.model,
      max_tokens: 1600,
      temperature: 0.65,
      system,
      messages: [...messages, { role: "assistant", content: "{" }],
    }),
  });

  const data = (await res.json()) as { content?: { text?: string }[] };
  const text = data.content?.map((c) => c.text ?? "").join("");
  if (!text) throw new Error("Empty response from Anthropic");
  return extractJson(`{${text}`);
}

/** Runs one turn against the configured provider. Throws on failure. */
export async function generateJson(
  system: string,
  messages: LlmMessage[],
): Promise<unknown> {
  const p = resolveProvider();
  if (!p) throw new Error("No AI provider configured");

  switch (p.id) {
    case "gemini":
      return callGemini(p, system, messages);
    case "openai":
      return callOpenAI(p, system, messages);
    case "anthropic":
      return callAnthropic(p, system, messages);
  }
}
