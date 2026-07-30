import type { Locale } from "./config";

/**
 * Translated names and one-liners for the ten design directions.
 *
 * Kept apart from `catalog.ts` so that file stays purely visual (preview
 * colours, radii) and apart from the main dictionaries so those stay readable.
 * Keys must match DESIGN_STYLES ids.
 */
type StyleCopy = { label: string; description: string };

export const STYLE_COPY: Record<Locale, Record<string, StyleCopy>> = {
  en: {
    "liquid-glass": {
      label: "Liquid Glass",
      description: "Glowing see-through panels that bend the light behind them. Like this site.",
    },
    glassmorphism: {
      label: "Glassmorphism",
      description: "Frosted glass cards over soft colour. Light, airy and friendly.",
    },
    minimalism: {
      label: "Minimalism",
      description: "Lots of white space, few elements, calm. Nothing competes for attention.",
    },
    "neo-brutalism": {
      label: "Neo-Brutalism",
      description: "Thick black outlines, hard shadows, loud colour. Bold and memorable.",
    },
    "dark-luxury": {
      label: "Dark & Luxury",
      description: "Deep black with gold accents and elegant type. Premium and expensive-looking.",
    },
    neumorphism: {
      label: "Neumorphism",
      description: "Soft shapes that look pressed out of the background. Gentle and tactile.",
    },
    "bento-grid": {
      label: "Bento Grid",
      description: "Everything in neat rounded tiles, like an Apple keynote slide. Very organised.",
    },
    "3d-immersive": {
      label: "3D & Immersive",
      description: "Real depth, floating objects and scenes that move as you scroll. Wow-factor.",
    },
    "aurora-gradient": {
      label: "Aurora Gradient",
      description: "Flowing colourful light in the background. Modern, energetic, startup-like.",
    },
    editorial: {
      label: "Editorial",
      description: "Big serif headlines and a strong grid, like a fashion magazine. Content-first.",
    },
  },

  ru: {
    "liquid-glass": {
      label: "Жидкое стекло",
      description: "Светящиеся прозрачные панели, преломляющие свет за собой. Как на этом сайте.",
    },
    glassmorphism: {
      label: "Гласморфизм",
      description: "Матовые стеклянные карточки на мягком цвете. Лёгкий и дружелюбный.",
    },
    minimalism: {
      label: "Минимализм",
      description: "Много воздуха, мало элементов, спокойствие. Ничто не спорит за внимание.",
    },
    "neo-brutalism": {
      label: "Необрутализм",
      description: "Толстые чёрные обводки, жёсткие тени, громкий цвет. Смело и запоминается.",
    },
    "dark-luxury": {
      label: "Тёмный люкс",
      description: "Глубокий чёрный с золотом и элегантный шрифт. Дорого и премиально.",
    },
    neumorphism: {
      label: "Неоморфизм",
      description: "Мягкие формы, будто выдавленные из фона. Деликатно и осязаемо.",
    },
    "bento-grid": {
      label: "Бенто-сетка",
      description: "Всё в аккуратных скруглённых плитках, как на презентации Apple. Очень организованно.",
    },
    "3d-immersive": {
      label: "3D и погружение",
      description: "Настоящая глубина, парящие объекты и сцены, меняющиеся при прокрутке. Вау-эффект.",
    },
    "aurora-gradient": {
      label: "Градиент-аврора",
      description: "Переливающийся цветной свет на фоне. Современно, энергично, по-стартаперски.",
    },
    editorial: {
      label: "Журнальный",
      description: "Крупные засечки и жёсткая сетка, как в модном журнале. Главное — содержание.",
    },
  },

  uz: {
    "liquid-glass": {
      label: "Suyuq shisha",
      description: "Orqasidagi yorug‘likni sindiruvchi yaltiroq shaffof panellar. Xuddi shu sayt kabi.",
    },
    glassmorphism: {
      label: "Glassmorfizm",
      description: "Yumshoq rang ustidagi xira shisha kartochkalar. Yengil va do‘stona.",
    },
    minimalism: {
      label: "Minimalizm",
      description: "Ko‘p bo‘sh joy, kam element, xotirjamlik. Hech narsa e’tibor uchun kurashmaydi.",
    },
    "neo-brutalism": {
      label: "Neobrutalizm",
      description: "Qalin qora chiziqlar, qattiq soyalar, baland rang. Dadil va esda qoladi.",
    },
    "dark-luxury": {
      label: "Qorong‘i hashamat",
      description: "Chuqur qora, oltin urg‘ular va nafis shrift. Qimmat va premium ko‘rinadi.",
    },
    neumorphism: {
      label: "Neomorfizm",
      description: "Fondan bo‘rtib chiqqandek yumshoq shakllar. Mayin va his qilinadigan.",
    },
    "bento-grid": {
      label: "Bento panjara",
      description: "Hammasi ozoda yumaloq plitkalarda, Apple taqdimoti kabi. Juda tartibli.",
    },
    "3d-immersive": {
      label: "3D va cho‘milish",
      description: "Haqiqiy chuqurlik, suzuvchi obyektlar va aylantirganda o‘zgaruvchi sahnalar. Hayratlanarli.",
    },
    "aurora-gradient": {
      label: "Aurora gradient",
      description: "Fonda oqayotgan rangli yorug‘lik. Zamonaviy, energiyali, startapga xos.",
    },
    editorial: {
      label: "Jurnal uslubi",
      description: "Yirik serif sarlavhalar va kuchli panjara, moda jurnali kabi. Avvalo mazmun.",
    },
  },
};

export function styleCopy(locale: Locale, id: string): StyleCopy | undefined {
  return STYLE_COPY[locale]?.[id] ?? STYLE_COPY.en[id];
}
