/**
 * Optional Telegram ping when a request lands. Entirely best-effort: a failure
 * here must never make the client's submission fail.
 */
export async function notifyNewRequest(input: {
  ref: string;
  kind: string;
  title: string;
  contactName: string;
  contactValue: string;
  budget: string;
}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return;

  const text = [
    `🆕 <b>New request ${escapeHtml(input.ref)}</b>`,
    `<b>${escapeHtml(input.title)}</b>`,
    `Type: ${escapeHtml(input.kind)}`,
    `From: ${escapeHtml(input.contactName)} — ${escapeHtml(input.contactValue)}`,
    `Budget: ${escapeHtml(input.budget)}`,
  ].join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.error("[notify] telegram failed:", err);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
