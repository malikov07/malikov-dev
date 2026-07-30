import type { ProjectKind } from "../catalog";
import { DEFAULT_LOCALE, type Locale } from "../i18n/config";
import type { AssistantTurn, Brief, ChatMessage } from "../types";

/**
 * A deterministic stand-in for the model, used when no API key is set (and as
 * the safety net when a provider call fails mid-conversation).
 *
 * It asks the same questions in the same order as the prompt does, so the
 * resulting brief has the same shape — the client just gets a less adaptive
 * interviewer. Keeping this working means the site is never broken, only
 * plainer.
 */

const VISUAL: ProjectKind[] = ["website", "mobile_app"];

type Script = {
  tooShort: string;
  features: string;
  timeline: string;
  timelineChips: string[];
  design: string;
  designAgain: string;
  contact: string;
  contactAgain: string;
  budget: string;
  review: string;
  untitled: string;
  unspecified: string;
};

const SCRIPTS: Record<Locale, Script> = {
  en: {
    tooShort:
      "Tell me a bit more so I can get this right — what should it do, and who is it for?",
    features:
      "Got it, thank you — that's noted.\n\nWhat are the main things people should be able to do? List them however you like.",
    timeline: "Noted. When would you like this ready?",
    timelineChips: ["As soon as possible", "In a few weeks", "No rush"],
    design:
      "Noted. Now the look of it — here are a few directions. Which one feels closest to what you want?",
    designAgain:
      "Pick whichever style feels closest — you can change your mind later.",
    contact:
      "Perfect. Now, how can I reach you — and when are you usually free to talk it through?",
    contactAgain: "Just need your name and the best way to reach you.",
    budget:
      "Last thing — roughly what budget did you have in mind? And if you have no idea yet, that's completely fine, just pick that.",
    review: "Here's everything I have — does this look right?",
    untitled: "New project",
    unspecified: "Not specified",
  },

  ru: {
    tooShort:
      "Расскажите чуть подробнее, чтобы я всё понял правильно — что это должно делать и для кого?",
    features:
      "Понял, спасибо — записал.\n\nЧто пользователи должны уметь делать? Перечислите как удобно.",
    timeline: "Записал. К какому сроку хотели бы получить?",
    timelineChips: ["Как можно скорее", "Через пару недель", "Не срочно"],
    design:
      "Записал. Теперь про внешний вид — вот несколько направлений. Какое ближе к тому, что вы хотите?",
    designAgain: "Выберите то, что ближе — потом можно передумать.",
    contact:
      "Отлично. Как с вами связаться — и когда вам обычно удобно всё обсудить?",
    contactAgain: "Нужно только имя и удобный способ связи.",
    budget:
      "Последнее — какой бюджет вы примерно закладывали? Если пока не представляете, это совершенно нормально, так и отметьте.",
    review: "Вот всё, что у меня есть — всё верно?",
    untitled: "Новый проект",
    unspecified: "Не указано",
  },

  uz: {
    tooShort:
      "To‘g‘ri tushunishim uchun biroz batafsilroq ayting — u nima qilishi kerak va kim uchun?",
    features:
      "Tushundim, rahmat — yozib oldim.\n\nOdamlar asosan nima qila olishi kerak? Xohlagancha sanab bering.",
    timeline: "Yozib oldim. Buni qachonga tayyor bo‘lishini xohlaysiz?",
    timelineChips: ["Imkon qadar tezroq", "Bir necha hafta ichida", "Shoshilinch emas"],
    design:
      "Yozib oldim. Endi ko‘rinishi haqida — mana bir nechta yo‘nalish. Qaysi biri siz xohlaganingizga yaqinroq?",
    designAgain: "Qaysi biri yaqinroq bo‘lsa, tanlang — keyin fikringizni o‘zgartirsangiz ham bo‘ladi.",
    contact:
      "Ajoyib. Siz bilan qanday bog‘lansam bo‘ladi — va odatda qachon gaplashishga qulay?",
    contactAgain: "Faqat ismingiz va qulay bog‘lanish usuli kerak.",
    budget:
      "Oxirgisi — taxminan qanday byudjet ko‘zda tutgandingiz? Agar hali tasavvur qilmasangiz, bu mutlaqo normal, shunday deb belgilang.",
    review: "Menda bor hamma narsa shu — to‘g‘rimi?",
    untitled: "Yangi loyiha",
    unspecified: "Ko‘rsatilmagan",
  },
};

function lastUserMessage(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content.trim();
  }
  return "";
}

function lastAssistantMessage(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant") return messages[i].content.trim();
  }
  return "";
}

/**
 * Splits "a, b and c" / bullet lists into separate items.
 *
 * " and " is only treated as a separator inside long segments. Splitting on it
 * unconditionally shreds ordinary phrasing — "cakes with photos and prices"
 * becomes two useless fragments.
 */
function toList(text: string): string[] {
  const clean = (s: string) => s.replace(/^[-*\d.)\s]+/, "").trim();

  return text
    .split(/[\n•;,]/)
    .flatMap((part) =>
      part.length > 60 ? part.split(/\b(?:and|и|va)\b/i) : [part],
    )
    .map(clean)
    .filter((s) => s.length > 2 && s.length < 160)
    .slice(0, 12);
}

function titleFrom(text: string, fallback: string): string {
  const first = text.split(/[.!?\n]/)[0].trim();
  const t = first.length > 4 ? first : text.trim();
  return t.length > 70 ? `${t.slice(0, 67)}…` : t || fallback;
}

export function scriptedTurn(
  kind: ProjectKind,
  messages: ChatMessage[],
  brief: Brief,
  locale: Locale = DEFAULT_LOCALE,
): AssistantTurn {
  const s = SCRIPTS[locale] ?? SCRIPTS[DEFAULT_LOCALE];
  const said = lastUserMessage(messages);
  const asked = lastAssistantMessage(messages);
  const notes: Brief = {};

  const askTimeline = (): AssistantTurn => ({
    reply: s.timeline,
    notes,
    stage: "details",
    ui: { quickReplies: s.timelineChips },
    done: false,
  });

  const askContact = (): AssistantTurn => ({
    reply: s.contact,
    notes,
    stage: "contact",
    ui: { contactForm: true },
    done: false,
  });

  // 1 — the idea itself. This answers the greeting, so it needs no guard.
  if (!brief.summary) {
    if (said.length < 12) {
      return { reply: s.tooShort, notes, stage: "discovery", ui: {}, done: false };
    }
    notes.summary = said;
    notes.title = titleFrom(said, s.untitled);
    return { reply: s.features, notes, stage: "discovery", ui: {}, done: false };
  }

  // 2 — what it does. The guard stops an answer meant for one question being
  // filed under whichever field happens to be empty.
  if (!brief.features?.length) {
    if (asked !== s.features) {
      return { reply: s.features, notes, stage: "discovery", ui: {}, done: false };
    }
    notes.features = toList(said);
    if (!notes.features.length) notes.features = [said.slice(0, 160)];

    if (VISUAL.includes(kind)) {
      return {
        reply: s.design,
        notes,
        stage: "design",
        ui: { designPicker: true },
        done: false,
      };
    }
    return askTimeline();
  }

  // 3 — the look. The gallery writes designStyle directly, so reaching here
  // again means they haven't chosen yet.
  if (VISUAL.includes(kind) && !brief.designStyle) {
    return {
      reply: s.designAgain,
      notes,
      stage: "design",
      ui: { designPicker: true },
      done: false,
    };
  }

  // 4 — timing
  if (!brief.timeline) {
    if (asked !== s.timeline) return askTimeline();
    notes.timeline = said || s.unspecified;
    return askContact();
  }

  // 5 — who they are
  if (!brief.contactName || !brief.contactValue) {
    if (asked === s.contact) return askContact();
    return {
      reply: s.contactAgain,
      notes,
      stage: "contact",
      ui: { contactForm: true },
      done: false,
    };
  }

  // 6 — money
  if (!brief.budgetText && !brief.budgetUnknown && brief.budgetMin == null) {
    return {
      reply: s.budget,
      notes,
      stage: "budget",
      ui: { budgetPicker: true },
      done: false,
    };
  }

  // 7 — read it back
  return { reply: s.review, notes, stage: "review", ui: { summary: true }, done: false };
}
