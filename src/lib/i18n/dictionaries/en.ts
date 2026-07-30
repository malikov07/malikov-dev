/**
 * English copy — the reference dictionary.
 *
 * `ru.ts` and `uz.ts` are typed against this shape, so adding a key here makes
 * TypeScript demand a translation in both of the others. Keep it that way.
 */
export const en = {
  meta: {
    title: "Malikov — Websites & Telegram bots, built properly",
    description:
      "Custom websites, Telegram bots and automation. Describe your idea to the AI assistant, get a plan in minutes, and pay only after you see the finished project.",
    ogDescription:
      "Describe your idea, get a plan in minutes, pay only after you see the result.",
  },

  nav: {
    services: "Services",
    work: "What I build",
    styles: "Styles",
    process: "How it works",
    faq: "FAQ",
    request: "Request a project",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
    home: "Malikov — home",
  },

  hero: {
    eyebrow: "Taking new projects",
    titleLine1: "Websites and Telegram bots,",
    titleBuilt: "built",
    titleProperly: "properly.",
    lead: "Describe what you want in your own words — no technical knowledge needed. You'll get a clear plan in minutes, and you only pay once the project is finished and you've seen it working.",
    ctaPrimary: "Request a project",
    ctaSecondary: "See what I build",
    promiseA: "Pay after delivery",
    promiseB: "Reply within a day",
    promiseC: "Fixed price up front",
    scrollDown: "Scroll down",
  },

  services: {
    eyebrow: "What I do",
    title: "Three kinds of work,",
    accent: "one standard.",
    lead: "Whichever you need, the process is the same: you describe it, I plan it, you approve it, then you see it working before any money changes hands.",
    start: "Start a request",
    website: {
      title: "Websites",
      body: "Fast, good-looking sites that work properly on a phone and actually bring you customers.",
      points: [
        "Landing pages & portfolios",
        "Online stores with payments",
        "Booking and enquiry forms",
        "Admin area to manage it yourself",
      ],
    },
    bot: {
      title: "Telegram bots",
      body: "Your business inside Telegram — taking orders and answering customers while you sleep.",
      points: [
        "Shop & ordering bots",
        "Booking and reminders",
        "Payments inside the chat",
        "Mini Apps with a full interface",
      ],
    },
    other: {
      title: "Everything else",
      body: "The awkward jobs: automating the boring parts, connecting tools, or rescuing a stalled project.",
      points: [
        "Automation scripts",
        "Connecting services together",
        "Collecting & cleaning data",
        "Fixing or finishing existing work",
      ],
    },
  },

  showcase: {
    eyebrow: "Showcase",
    title: "What I build,",
    accent: "and what it costs you to ask.",
    lead: "Nothing. Pick anything close to your idea and start a request — the assistant works out the details with you in a couple of minutes.",
    requestAria: "Request a project like: {title}",
    items: {
      landing: {
        title: "Landing pages that convert",
        body: "One focused page built around a single action — call, order, or book. Loads fast, looks sharp on a phone.",
        tags: ["Landing", "Portfolio", "Launch page"],
      },
      shopBot: {
        title: "Shop bots that take orders",
        body: "Customers browse, order and pay without ever leaving Telegram. You get every order in a chat.",
        tags: ["Catalogue", "Payments", "Orders"],
      },
      store: {
        title: "Online stores",
        body: "A real shop: products, cart, card payments and a place for you to manage stock yourself.",
        tags: ["Cart", "Payments", "Admin"],
      },
      booking: {
        title: "Booking & appointments",
        body: "Clients pick a slot, you get notified, nobody double-books. Works for salons, clinics and studios.",
        tags: ["Calendar", "Reminders", "No-shows"],
      },
      dashboard: {
        title: "Dashboards & admin panels",
        body: "See what's happening in your business at a glance, and change things without calling a developer.",
        tags: ["Reports", "Roles", "Exports"],
      },
      automation: {
        title: "Automation & integrations",
        body: "Make the boring work happen by itself — moving data between tools, generating reports, sending alerts.",
        tags: ["Scripts", "APIs", "Scraping"],
      },
    },
    bandTitle: "Don't see your idea here?",
    bandBody:
      "That's normal — most projects are a mix. Describe yours in plain words and the assistant will shape it into a proper brief.",
    bandNote: "Takes about two minutes · No payment until it's built",
  },

  styles: {
    eyebrow: "Ten directions",
    title: "Pick the look.",
    accent: "No design vocabulary required.",
    lead: "During the chat you'll see these as real previews and just point at the one you like. Not sure? Say so, and I'll choose what suits your business.",
    note: "Hover to pause · Click any style to start a request with it",
    noteTouch: "Swipe to browse · Tap any style to start a request with it",
    requestAria: "Request a project in the {label} style",
  },

  process: {
    eyebrow: "How it works",
    title: "Four steps, and",
    accent: "you pay last.",
    lead: "The order matters. You see a working project before you spend anything, which means the risk of it going wrong sits with me, not with you.",
    steps: [
      {
        title: "Tell me what you want",
        body: "Open the chat and describe your idea however you like. The assistant asks a few simple questions, shows you design options, and writes the brief for you.",
        meta: "About 2 minutes",
      },
      {
        title: "I review and reply",
        body: "I read the brief properly and get back to you with a fixed price and a realistic timeline. If it isn't something I can do well, I'll tell you that instead of taking your money.",
        meta: "Usually within a day",
      },
      {
        title: "I build it",
        body: "You get progress updates as it comes together, and you can ask for changes along the way — not just at the end when it's expensive to fix.",
        meta: "Timeline agreed up front",
      },
      {
        title: "You see it, then you pay",
        body: "The finished project goes live for you to try properly. Money only changes hands once you're happy with what's in front of you.",
        meta: "Zero risk to you",
      },
    ],
  },

  faq: {
    eyebrow: "Questions",
    title: "The things people",
    accent: "actually ask.",
    items: [
      {
        q: "Do I really only pay at the end?",
        a: "Yes. You see the finished project working before any money changes hands. For larger projects we can split it into stages, and you still see each stage working before you pay for it.",
      },
      {
        q: "What if I don't like the result?",
        a: "Then it isn't finished. Changes during the build are part of the job, not an extra. If it's genuinely not what we agreed and I can't put it right, you don't pay.",
      },
      {
        q: "How much does a project cost?",
        a: "It depends entirely on what it does. A simple landing page and a full online store are very different jobs. Send a request and you'll get a fixed price before anything starts — no hourly surprises.",
      },
      {
        q: "I don't know anything technical. Is that a problem?",
        a: "Not at all — the assistant is built for exactly that. Describe what you want the way you'd explain it to a friend. It never asks technical questions, and it shows you pictures instead of jargon when it comes to design.",
      },
      {
        q: "Who owns the finished project?",
        a: "You do. The code, the design and the accounts are yours, handed over at the end. You're never locked into me to keep it running.",
      },
      {
        q: "Can you fix or finish something that already exists?",
        a: 'Often, yes. Pick "Something else" when you start a request and describe what you have and what\'s wrong with it. If it\'s beyond saving I\'ll say so honestly.',
      },
      {
        q: "Why are mobile apps disabled?",
        a: "Because I'd rather do three things properly than four things badly. Mobile apps open once I can hold them to the same standard — it's coming.",
      },
    ],
  },

  cta: {
    eyebrow: "Ready when you are",
    titleA: "Describe your idea.",
    titleB: "See it before you pay.",
    lead: "Two minutes of questions, no obligation, and a real answer from a real person within a day.",
    button: "Request a project",
  },

  footer: {
    blurb:
      "Websites, Telegram bots and automation, built to a standard worth paying for — after you've seen it working.",
    explore: "Explore",
    rights: "All rights reserved.",
    admin: "Admin",
  },

  kinds: {
    heading: "What should we build?",
    lead: "Pick a category and I'll ask you a few quick questions — no technical knowledge needed. It takes about two minutes.",
    footnote: "You only pay once the project is finished and you've seen it working.",
    soon: "Soon",
    website: {
      label: "Website",
      tagline: "Landing pages, stores, dashboards",
      blurb:
        "A site people visit in a browser — from a one-page launch site to a full store with payments and an admin area.",
      examples: ["Landing page", "Online store", "Portfolio"],
    },
    telegram_bot: {
      label: "Telegram Bot",
      tagline: "Shops, booking, automation",
      blurb:
        "A bot your customers talk to inside Telegram. Takes orders, answers questions, collects payments, notifies you.",
      examples: ["Shop bot", "Booking bot", "Support bot"],
    },
    other: {
      label: "Something else",
      tagline: "Scripts, integrations, source code",
      blurb:
        "Automation scripts, API integrations, scrapers, fixing or finishing an existing project, or source code you can build on.",
      examples: ["Automation", "Integrations", "Scraper"],
    },
    mobile_app: {
      label: "Mobile App",
      tagline: "iOS & Android",
      blurb:
        "Native and cross-platform mobile apps. Not open for new requests yet — this lands soon.",
      examples: ["iOS", "Android", "React Native"],
    },
  },

  chat: {
    headerSuffix: "request",
    headerHint: "Answer in your own words — I'll handle the rest.",
    back: "Back to project types",
    placeholder: "Type your answer…",
    send: "Send",
    privacy: "Your details are only used to reply to this request.",
    greetingWebsite:
      "Hi! I'm here to work out exactly what you need, so nothing gets lost before we start.\n\nSo — what kind of website do you have in mind? Tell me about it in your own words, whatever level of detail you have.",
    greetingBot:
      "Hi! Let's figure out what your bot should do.\n\nTell me about it in your own words — what should it do for you or your customers? No need to be technical.",
    greetingOther:
      "Hi! Tell me what you need built.\n\nIt can be a script, an integration, fixing something that's broken, or finishing a project someone else started. Describe it however makes sense to you.",
    errorGeneric: "Something went wrong.",
    errorSend: "Could not send your request.",
  },

  design: {
    notSure: "Not sure — you pick for me",
    notSureEcho: "I'm not sure — you choose what fits best",
    pickEcho: "I like the {label} style.",
  },

  contact: {
    name: "Your name",
    namePlaceholder: "e.g. Bekzod",
    nameError: "Please add your name.",
    method: "Best way to reach you",
    telegram: "Telegram",
    phone: "Phone",
    email: "Email",
    valueError: "Please add your {method}.",
    when: "When are you free to talk?",
    slots: ["Anytime", "Morning", "Afternoon", "Evening", "Weekends"],
    exactPlaceholder: "Anything more exact? e.g. after 6pm on weekdays (optional)",
    continue: "Continue",
    echo: "My name is {name}. Reach me on {method}: {value}. I'm free {availability}.",
    anytime: "anytime",
  },

  budget: {
    currency: "Currency",
    customPlaceholder: "Or type your own number…",
    send: "Send",
    dontKnow: "I don't know — you tell me",
    dontKnowEcho: "Honestly, I have no idea what this should cost.",
    dontKnowNote: "Client isn't sure yet",
    bandEcho: "My budget is around {band}.",
  },

  summary: {
    heading: "Your brief",
    project: "Project",
    about: "About",
    features: "Features",
    scope: "Scope",
    style: "Style",
    audience: "For",
    languages: "Languages",
    timing: "Timing",
    likes: "Likes",
    contact: "Contact",
    free: "Free",
    budget: "Budget",
    budgetUnknown: "Not sure yet — open to a quote",
    budgetNone: "Not stated",
    edit: "Change something",
    confirm: "Looks right — send it",
    sending: "Sending…",
  },

  success: {
    title: "Got it — your request is in.",
    bodyA: "I'll review it and get back to you on",
    bodyB: ", usually within a day. Keep this reference in case you want to follow up.",
    copied: "copied",
    note: "Remember: you pay only after the project is finished and you've seen it working.",
    done: "Done",
  },
};

// No `as const` above: it would freeze every value to its literal type, and
// the other dictionaries could then never assign a different string.
export type Dictionary = typeof en;
