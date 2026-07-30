# Deploying to Netlify + Neon

Free, and the free tiers of both permit commercial use — which matters here,
since this site sells development work. (Vercel's Hobby plan does **not**: it is
personal, non-commercial use only. That is the one reason this guide does not
use Vercel, which otherwise has the best Next.js support.)

Total cost: nothing. Total time: about half an hour, most of it waiting for DNS.

---

## Why the database changed

The app used SQLite writing to `prisma/dev.db`. That cannot work on Netlify:
serverless functions get a fresh, read-only-in-practice filesystem on every cold
start, so the database file would be recreated empty and every client request
submitted since the last deploy would vanish. There is no warning when this
happens — the site keeps looking healthy.

So the datasource is now Postgres. Nothing else about the schema changed; every
field was already portable. What this costs you: **local development now needs a
Postgres connection too**, since a Prisma client is generated for one provider
only. Neon's free tier includes database branching, which is the tidy way to do
this — one branch for production, one for local.

## Why the Neon driver, not plain node-postgres

`src/lib/db.ts` uses `@prisma/adapter-neon`, which reaches the database over
WebSockets on port **443**, rather than `@prisma/adapter-pg`, which uses the
Postgres wire protocol on port **5432**.

Two reasons, and the first was found the hard way. On the network this was
developed on, a TCP connection to Neon on 5432 completes its handshake and then
receives no protocol reply at all — the connection simply hangs until it times
out. Port 443 to the same host completes a full TLS handshake with a valid
certificate. That pattern is ISP interference with a non-web port, and it is
common on consumer connections in the region. A driver on 443 is indistinguishable
from ordinary HTTPS and is left alone.

The second reason would apply regardless: on serverless there is no long-lived
process to keep a TCP pool warm between invocations, and a pool per instance is
exactly how a database's connection limit gets exhausted once the platform
scales out. An HTTP/WebSocket driver has no pool to exhaust.

`PrismaNeon` and not `PrismaNeonHttp`, because the HTTP-only variant cannot run
transactions — and accepting a request writes the status change and its audit
event together.

---

## 1. Database (Neon)

1. Sign up at <https://neon.tech> and create a project. Pick the region closest
   to your users — `eu-central-1` (Frankfurt) is the usual choice for Uzbekistan.
2. From the dashboard, copy the **pooled** connection string. The host contains
   `-pooler`:

   ```
   postgresql://user:pass@ep-something-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

   Take the pooled one, not the direct one. Each warm serverless instance holds
   its own connection pool, and the direct endpoint runs out of connections as
   soon as a few instances are alive at once.

3. Apply the schema:

   ```powershell
   # .env, DATABASE_URL = the Neon pooled string
   npm run db:deploy
   ```

   That runs `prisma migrate deploy` against `prisma/migrations/0_init`, which
   creates both tables, the indexes and the foreign key.

   **If this hangs and eventually reports `P1001: Can't reach database
   server`, it is your network, not your connection string.** The Prisma CLI
   speaks the Postgres wire protocol on port 5432, and many consumer and mobile
   ISPs — Uzbek ones included — complete the TCP handshake on that port and then
   drop the traffic, so it stalls rather than failing outright. The app itself is
   unaffected: it uses Neon's WebSocket driver on port 443 (see below). Your
   options are a VPN, or simply skipping this step — `netlify.toml` runs
   `db:deploy` on every build, from Netlify's servers, where 5432 is open.

4. Optional, to have something in the admin panel on day one:

   ```powershell
   npm run db:seed
   ```

   It only creates `MD-DEMO*` rows and is safe to re-run. Delete them from the
   admin panel once real requests start arriving.

---

## 2. Repository

Netlify deploys from a Git repo, and this project is not one yet.

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/malikov-dev.git
git push -u origin main
```

`.gitignore` already excludes `.env`, `*.db` and the generated Prisma client, so
none of your secrets or local data go up. Check `git status` before the first
push anyway — it is the one moment where a mistake is permanent.

---

## 3. Netlify

1. <https://app.netlify.com> → **Add new site → Import an existing project** →
   pick the GitHub repo.
2. Leave the build settings alone. `netlify.toml` in the repo root already sets
   the build command, the publish directory, the Node version and the cache and
   security headers.
3. Add the environment variables below under **Site configuration → Environment
   variables** *before* the first deploy, or it will fail at the database step.

| Variable | Value | Required |
| --- | --- | --- |
| `DATABASE_URL` | Neon **pooled** connection string | Yes |
| `ADMIN_PASSWORD` | A real password. Not `admin`, not `change-me`. | Yes |
| `ADMIN_SESSION_SECRET` | 32 random bytes as hex (below) | Yes |
| `NEXT_PUBLIC_SITE_URL` | `https://malikov-dev.uz` | Only if the domain differs |
| `GEMINI_API_KEY` | Google AI Studio key — has a free tier | No |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Ping yourself on each new request | No |

Generate the session secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`ADMIN_SESSION_SECRET` is not optional in production — `src/lib/auth.ts` throws
on boot if it is missing or too short, deliberately, so that the admin panel can
never come up with an unsigned session cookie.

Without an AI key the intake chat still works; it falls back to the scripted
flow in `src/lib/ai/fallback.ts`, in all three languages. The AI makes it much
better, and Gemini's free tier is enough for this volume.

---

## 4. Domain

In Netlify: **Domain management → Add a domain** → `malikov-dev.uz`.

Netlify will show you the exact DNS records to create — use the values it gives
you rather than any written here, because its load-balancer addresses change.
There are two ways to point the domain, and your registrar decides which:

- **Netlify DNS** — change the nameservers at your `.uz` registrar to the four
  Netlify gives you. Easiest, and apex + `www` both work automatically.
- **External DNS** — keep your registrar's nameservers and add an `A` record for
  the apex plus a `CNAME` for `www`. Use this if the registrar will not delegate
  nameservers, which some `.uz` resellers will not.

TLS is issued automatically by Let's Encrypt once DNS resolves. It can take
anywhere from a few minutes to a few hours; the certificate cannot be issued
before propagation finishes, so an error on the domain page in the first hour is
normal rather than a misconfiguration.

Set `malikov-dev.uz` as the **primary domain** so the `.netlify.app` URL
redirects to it and search engines only ever index one hostname.

---

## 5. After the first deploy — check these

- `/en`, `/ru`, `/uz` all render, and the language switcher moves between them.
- Submit a real request through the chat, end to end.
- It appears at `/admin` — this is the actual proof the database is wired up.
- Accept it with a comment, and confirm the decision sticks after a refresh.
- View source on `/uz` and confirm the canonical and `hreflang` tags say
  `malikov-dev.uz`. If they say `malikov.dev`, `NEXT_PUBLIC_SITE_URL` is not set.
- `/admin` returns `noindex`, and is not reachable without the password.

---

## Known limits of this setup

Worth knowing before they surprise you, not reasons to avoid deploying:

- **The rate limiter is per-instance and in-memory** (`src/lib/rate-limit.ts`).
  On serverless, each warm instance keeps its own counter, so the effective
  limit is roughly the configured one multiplied by the number of live
  instances, and it resets on every cold start. Fine at this traffic; move it to
  the database or Upstash if the intake endpoint ever gets abused.
- **Cold starts.** The first request after a quiet period takes a second or two
  while a function boots and connects to Postgres. Neon free-tier compute also
  suspends when idle and takes a moment to wake.
- **Neon's free tier suspends after inactivity** and has a storage cap. Neither
  matters at this scale, but the project is deleted after a long period of total
  inactivity — log in occasionally, or check their current policy.
- **Netlify's Next.js runtime tracks the framework with a lag.** Next 16 is
  recent. If a deploy fails inside the runtime rather than in your own code, the
  usual fix is to wait for a runtime release or pin Next one minor lower. Your
  build passing locally is not proof the adapter handles it.
- **Migrations run in the build command.** `npm run db:deploy` executes before
  `next build`, so schema changes always land before the code that needs them.
  Two simultaneous deploys could race; with one developer, they will not.

---

## Local development after this change

`.env` needs a real `DATABASE_URL` now — there is no SQLite fallback. Point it
at a Neon **development branch** (Branches → New branch in the Neon dashboard)
so experiments cannot touch live client requests.

`npm run dev`, `npm run db:seed` and the app itself all go through the Neon
driver on 443, so they work even where 5432 is blocked. The Prisma CLI commands
that open their own connection do **not**:

| Command | Port | Works behind a 5432 block |
| --- | --- | --- |
| `npm run dev` / the app | 443 | Yes |
| `npm run db:seed` | 443 | Yes |
| `npm run db:deploy` | 5432 | No — runs on Netlify's build instead |
| `npm run db:studio` | 5432 | No — use the Neon dashboard's SQL editor |

If you want all of them locally, a VPN is the simplest fix. Otherwise let
Netlify apply migrations and browse data in Neon's own console.

`prisma/dev.db` is now dead weight and can be deleted.
