# malikov.dev

A studio site for taking website, Telegram bot and automation work. Clients
describe what they want to an AI assistant in plain language; it turns the
conversation into a structured brief and files it. You accept or reject each
one from an admin panel, with a comment.

The pitch on the site is **you pay after you see the finished project**.

---

## Running it

```bash
npm install
cp .env.example .env      # then edit it — DATABASE_URL is required
npm run db:push           # applies the schema to that database
npm run dev               # http://localhost:3000
```

`DATABASE_URL` must point at a Postgres database — there is no local-file
fallback. Use a local Postgres or any throwaway one, but never the production
database: `db:push` changes schemas in place.

Optional demo data so the admin panel isn't empty:

```bash
npm run db:seed
```

The admin panel is at **/admin**, behind `ADMIN_PASSWORD` from `.env`. The
example file ships a placeholder; production runs a real one.

---

## The AI assistant

The intake chat works with **Gemini, OpenAI or Anthropic**. Put a key in `.env`
and it's picked up automatically:

```env
GEMINI_API_KEY="..."      # tried first  (has a free tier)
OPENAI_API_KEY="..."      # tried second
ANTHROPIC_API_KEY="..."   # tried third
```

Force one with `AI_PROVIDER=openai`, or change the model with `AI_MODEL`.

**With no key at all, the chat still works.** It falls back to a scripted
interviewer that asks the same questions in a fixed order and produces the same
brief — just without adapting to what the client says. The same fallback catches
provider outages mid-conversation, so a client is never left staring at a broken
chat. Add a key when you're ready; nothing else changes.

The assistant is instructed to never use technical words, ask one question at a
time, and answer in whatever language the client writes in.

---

## Languages

The site ships in **English, Russian and Uzbek**, on real URLs:

```
/en   /ru   /uz
```

A bare `/` redirects to the visitor's language — their previous choice
(cookie) first, then their browser's `Accept-Language`, then English. The
switcher sits in the top-right of the nav. Each page declares `hreflang` for
the other two, so the three don't compete as duplicates in search.

Everything the client sees is translated, including the intake chat, the ten
design style names and the scripted fallback questions. The AI is told which
language the client is browsing in, and switches if they write in another one.

**To edit copy or add a language:**

- `src/lib/i18n/dictionaries/en.ts` is the reference. It is plain TypeScript, so
  adding a key there makes the compiler demand a translation in `ru.ts` and
  `uz.ts` — translations can't silently go missing.
- `src/lib/i18n/styles.ts` holds the design style names.
- `src/lib/ai/fallback.ts` holds the no-API-key chat questions.
- A fourth language means adding it to `LOCALES` in `src/lib/i18n/config.ts`
  plus one new dictionary file.

The admin panel stays in English — it's a private tool for one person.

---

## How a request flows

1. Client clicks **Request a project** and picks a category — Website, Telegram
   Bot, or Something else. Mobile App is visible but disabled, marked *Soon*.
2. The chat opens. The assistant asks about the idea, shows the ten design
   styles as real previews to pick from, then collects the details.
3. It asks for name, contact (Telegram / phone / email) and when they're free to
   talk — "anytime" is one tap.
4. It asks about budget, with **"I don't know"** as a first-class answer. That's
   stored as `budgetUnknown`, never as a budget of zero.
5. It reads the whole brief back. Once confirmed, the request is saved and the
   client gets a reference like `MD-7K2Q`.
6. You see it in `/admin` and **Accept** or **Reject** with a comment, then move
   it to *In progress* and *Done* as you work.

Every status change is recorded in a history log. Admin notes on each request
are private and never leave the panel.

Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to get a Telegram message each
time a request arrives.

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Typography | The Apple system stack — real SF Pro on iOS/macOS, no webfont |
| Animation | Motion (Framer Motion) |
| Background | Hand-written WebGL/GLSL — no 3D library |
| Database | Prisma 7 + Postgres, via the node-postgres driver adapter |
| AI | Gemini / OpenAI / Anthropic, via a small provider layer |
| i18n | Locale-routed, no library |

### The background

`src/components/visuals/` renders a full-page shader: merged metaballs treated
as liquid glass over a drifting aurora. The blobs are a 2D signed-distance
field turned into a height map; the gradient of that height gives a surface
normal, which is used to refract the background behind the glass, split it per
colour channel, and light the surface. It reacts to the pointer and to scroll.

It degrades on its own — reduced-motion draws one static frame, a lost context
or missing WebGL falls back to a CSS gradient, a background tab stops
rendering, and the resolution drops if frames run long.

### The database

Postgres, reached through Prisma's node-postgres driver adapter. It started as
SQLite, which did not survive the first host — that one discarded its filesystem
between requests, so the file was recreated empty and every request filed since
the previous deploy disappeared, with the site still looking healthy.

Nothing in the schema is Postgres-specific: list fields are stored as JSON
strings, so they are portable as-is. See `DEPLOY.md` for how the deployed
database is set up, backed up and restored.

---

## Editing content

Almost everything a non-developer would want to change lives in a few files:

- **`src/lib/i18n/dictionaries/`** — all site copy, in all three languages.
- **`src/lib/catalog.ts`** — the project categories and the ten design styles'
  preview colours. Add or remove a style here and it updates the chat, the
  homepage strip and the admin panel at once.
- **`src/lib/ai/prompt.ts`** — how the assistant behaves: its tone, the order it
  asks things in, and what it must never say.
- **`src/components/request/ChatWidgets.tsx`** — the suggested budget bands.

Landing page sections are separate components in `src/components/site/`.

### Tuning the background

`src/components/visuals/shader.ts` holds the palette constants and the blob
maths. In `LiquidBackground.tsx`, `GAIN` and `MAX` control how far the blob
under the cursor stretches as it moves — raise `GAIN` for a more liquid,
elastic feel, lower it for a stiffer one.

### A note on the showcase

The **What I build** section shows project *types* with abstract UI mocks, not
screenshots of real client work — nothing on the site claims a client or a
result that hasn't happened. Once you have real projects, replace the items in
`src/components/site/Showcase.tsx` with them.

---

## Scripts

```bash
npm run dev         # dev server
npm run build       # production build
npm run start       # serve the build
npm run typecheck   # tsc --noEmit
npm run db:push     # apply schema to the database
npm run db:studio   # browse the database
npm run db:seed     # insert demo requests
```

---

## Before deploying

- [ ] Change `ADMIN_PASSWORD`
- [ ] Set `ADMIN_SESSION_SECRET` to a random string —
      `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
      (the app refuses to start without it in production)
- [ ] Add an AI key
- [ ] Move to Postgres if the host has no persistent disk
- [ ] Point `SITE` in `src/app/layout.tsx` at the real domain
