# Instagram setup — it-network.uz

Everything needed to open the account and make the first post. Colours, type and
the liquid-glass treatment are taken from the live site, so the profile and the
landing page read as one brand.

## Files

| File | Output | Size | Use |
| --- | --- | --- | --- |
| `profile-photo.html` | `profile-photo.png` | 1080×1080 | Profile picture |
| `post-services.html` | `post-services.png` | 1080×1350 | First feed post |

Both are plain HTML — no build step, no fonts to install. Re-render them with
the snippet at the bottom of this file after any edit.

## Before you start — three things only you can fill in

These are left as placeholders on purpose. Replace them everywhere they appear:

1. **Telegram handle** — the site's chat collects one from the client, but the
   codebase has no handle of your own (`+998 90 123 45 67` in
   `src/components/request/ChatWidgets.tsx` is example data). Needed for the
   profile's contact button.
2. **Phone number** — same reason, if you want the call/WhatsApp button.
3. **Is `it-network.uz` live yet?** The post image prints that domain and the
   bio link points at it. If it is not serving the site yet, point the link at
   your Telegram instead and swap the footer text in `post-services.html` —
   sending traffic to a dead domain is worse than sending none.

---

## 1. Account type

Open the account with a personal profile, then convert:

**Settings → Account type and tools → Switch to professional account → Business.**

Business (not Creator) is the right one: it allows the **contact buttons** and
the **action button**, which Creator restricts.

- **Category:** `Software company` — the name says team, so the category should
  agree. `Web designer` is the alternative and converts a little better with
  small local clients because it is a job they recognise, but it reads as one
  freelancer, which is no longer what you are.
- **Show category on profile:** on.
- **Contact options:** Telegram is not a native Instagram contact type, so use
  **email** as the button and put the Telegram handle in the bio text where it
  is tappable-adjacent and obvious.

## 2. Username

**Instagram usernames cannot contain a hyphen** — only letters, digits, periods
and underscores. So `it-network` is not available to you as a handle no matter
what, and the domain cannot be matched character for character. Closest options,
in order of preference:

| Username | Notes |
| --- | --- |
| `itnetwork.uz` | Closest legal match to `it-network.uz` — same words, same TLD signal. |
| `it.network` | Cleanest to read and say. Different from the domain, but not confusingly so. |
| `itnetwork` | Grab whichever of these you can as well, to keep someone else off the name. |
| `it.network.uz` | Only if the two above are taken — three separators is a lot. |

Check all four before you settle on one. "IT network" is two ordinary words, so
unlike the old name these are likely already taken somewhere — and a handle
that is close but not the one you print on your own posts is worse than a
slightly longer one that you can use consistently everywhere.

Avoid digits and underscores beyond this — they read as an unofficial or backup
account, which is the opposite of what a paid-work profile needs.

Because the handle and the domain cannot match exactly, print the domain in the
bio text as well, so the two are visibly connected.

## 3. Name field (30 characters, and it is searchable)

The **Name** field is indexed by Instagram search; the username alone is not.
So it must carry the keywords a client would actually type, not your name.

| Locale | Name field | Length |
| --- | --- | --- |
| Uzbek (recommended) | `Sayt va Telegram bot yasash` | 27 |
| Russian | `Сайты и Telegram-боты` | 21 |
| English | `Websites & Telegram bots` | 24 |

The team name already lives in the username, so spending these 30 characters on
"IT-Network" again would waste the only searchable field you get — and "IT" and
"network" are words clients search for far less often than "sayt" or "bot".

## 4. Bio (150 character limit)

All three fit with room to spare — counts verified, including emoji. Pick one
language to lead with; mixing all three in 150 characters leaves no space to say
anything.

**Uzbek — recommended.** Your own headline edit ("sifatli va arzon") and the UZS
pricing in the site both point at the local market as the primary audience.

```
Sayt • Telegram bot • avtomatlashtirish
Reja — 2 daqiqa. To‘lov — tayyor bo‘lgandan keyin.
Narx oldindan aniq
it-network.uz ⤵️
```

**Russian** — for a Tashkent audience that browses in Russian.

```
Сайты • Telegram-боты • автоматизация
План — 2 минуты. Оплата — после сдачи.
Цена известна заранее
it-network.uz ⤵️
```

**English** — if you want to take work from outside the region.

```
Websites • Telegram bots • automation
Plan in 2 minutes. You pay after delivery.
Fixed price up front
it-network.uz ⤵️
```

Line breaks work in the Instagram bio, but the editor on some Android builds
strips them. If that happens, paste the bio from a notes app, or separate the
lines with ` · ` instead.

Every version leads with **what you make**, then the **pay-after-delivery**
promise — that promise is the strongest thing you have and no competitor
advertises it, so it should never be below the fold.

## 5. Link

One primary link, plus up to four more under **Edit profile → Links**.

1. `https://it-network.uz` — primary. The request chat is the conversion point,
   so send people straight there rather than to a link aggregator.
2. `https://t.me/<your-handle>` — secondary, for people who want to talk first.

Do not use Linktree here. It adds a click between the ad and the chat, and the
site already does the job a link page would do.

## 6. First post

Use `post-services.png`. Caption, Uzbek:

```
Sayt, Telegram bot yoki IT loyiha kerakmi?

Nima kerakligini o‘z so‘zlaringiz bilan aytasiz — texnik bilim shart emas.
Bir necha daqiqada aniq reja va aniq narx olasiz.

Eng muhimi: to‘lov faqat loyiha tayyor bo‘lib, uni ishlayotgan holda
ko‘rganingizdan keyin. Ya’ni xavf menda, sizda emas.

• Saytlar — lending, onlayn do‘kon, admin panel
• Telegram botlar — buyurtma, to‘lov, avtojavob
• Avtomatlashtirish — skript, integratsiya, tuzatish

Buyurtma berish → profildagi havola
```

Hashtags — put them in the **first comment**, not the caption, so the caption
stays readable. Mixing large and small tags gives a small account somewhere to
actually rank:

```
#sayt #saytyasash #saytbuyurtma #telegrambot #botyasash #veb #vebsayt
#dasturchi #onlayndokon #avtomatlashtirish #toshkent #tashkent #uzbekistan
#biznesuz #uzbekistanbusiness #startupuz #ittexnologiya #webdesign
#webdeveloper #telegrambots
```

Twenty tags. Instagram allows thirty but flags dense tagging on new accounts;
twenty relevant ones outperform thirty padded ones.

## 7. Grid plan for the first week

Instagram crops feed posts to the **centre square** in the profile grid.
`post-services.png` is composed for that — the headline and the three service
cards sit inside the centre 1080×1080, and only the footer line falls outside.
Keep that constraint for anything you add.

| # | Post | Why |
| --- | --- | --- |
| 1 | `post-services.png` | What you do, and the pay-after-delivery promise. |
| 2 | `reel/reel-yes-chain.mp4` | Reel. Four small requests, four yeses — sells permission to ask. |
| 3 | `reel/reel-message.mp4` | Reel. One plain message becomes a finished site. |
| 4 | Price honesty post | "Kichik loyihalar ham qabul qilinadi" — the small-budget message from the site. |

Three posts is enough to look established. An empty grid behind a paid link is
what makes people bounce.

The two reels, their captions, and the five working demo sites they film live
in [`reel/`](reel/README.md) — including the note that **you must add music in
the Instagram editor**, because the rendered MP4s are silent.

Reels are what will actually grow the account: Instagram pushes them to people
who do not follow you, which a feed image never gets. The static post above is
what a visitor sees *after* a reel sends them to your profile, so it still
earns its place at the top of the grid.

## 8. Re-rendering the images

Easiest, if you have already rendered the reels once — `reel/` carries
playwright-core and a Chromium for the video, so the same browser can do the
stills:

```bash
cd reel
node render-posts.mjs
```

That writes `profile-photo.png` (1080×1080) and `post-services.png` (1080×1350)
at exact size, with the background animations pinned so two runs give the same
image. It is the reliable way to keep the two in step after a brand change.

The hand route below needs nothing installed, and is still worth knowing.

Chromium blocks `file:` URLs, so the files have to be served rather than opened
directly. The dev server already serves anything under `public/`:

```powershell
New-Item -ItemType Directory -Force public\__brand_tmp | Out-Null
Copy-Item brand\instagram\*.html public\__brand_tmp\ -Force
```

Then, in Chrome, for each file:

1. Open `http://localhost:3000/__brand_tmp/profile-photo.html`
2. `Ctrl+Shift+M` for the device toolbar, and type the size in by hand —
   **1080 × 1080** for the profile photo, **1080 × 1350** for the post
3. DevTools three-dot menu → **Capture screenshot**

That gives an exact-size PNG with nothing extra installed. Clean up when done:

```powershell
Remove-Item -Recurse -Force public\__brand_tmp
```

Leaving the folder in `public/` would publish these HTML files on the live site,
which is why it gets deleted rather than kept.

> Playwright is not a dependency of this project, so `npx playwright screenshot`
> would download the package and a browser (~150 MB) before it ran. The DevTools
> route above is quicker unless you are rendering these repeatedly.

### A note on the typeface

The site's font stack starts with `-apple-system`, which resolves to real SF Pro
on a Mac or iPhone and to Segoe UI Variable on Windows. These PNGs were rendered
on Windows, so they carry Segoe UI — close in feel, slightly wider. Re-rendering
them on a Mac gives you true SF Pro and a marginally tighter headline. Either is
fine; do not mix the two across posts.

The italic accent falls back to Georgia, because Instrument Serif is loaded by
`next/font` and is not available to a standalone HTML file. That matches the
site's own declared fallback (`"New York", Georgia, serif`), so it is consistent
rather than accidental.
