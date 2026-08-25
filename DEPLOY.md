# Deployment

The site runs on a single Ubuntu 24.04 VM that also holds its database. No
platform, no managed services, nothing to bill by the request.

> **The rename from `malikov-dev` to `it-network` is half done.** Everything
> facing the outside world — DNS, the certificate, nginx, the canonical tags —
> is on the new name and serving. Everything *inside* the box still uses the
> old one: `/srv/malikov-dev`, `malikov-dev.service`, `malikov-deploy`,
> `malikov-backup`, the `malikov` system user and the nginx snippet filenames.
> So where a command below says `it-network`, type `malikov` until the
> remaining steps at the end of this file have been run.

| | |
| --- | --- |
| Host | `20.91.224.41` — Ubuntu 24.04, 2 vCPU, 897 MB RAM, 29 GB disk |
| Domain | `it-network.uz` and `www.it-network.uz`, apex `A` + `www` `CNAME` |
| TLS | Let's Encrypt via certbot, renewed by `certbot.timer` |
| Web server | nginx, terminating TLS and proxying to loopback |
| App | Next 16 under systemd as `it-network.service`, on `127.0.0.1:3000` |
| Database | Postgres 16 on the same machine, over localhost |
| SSH | `ssh azureuser@20.91.224.41` |

## Layout on disk

```
/srv/it-network/
├── .env          secrets, 0600, owned by the app user — OUTSIDE the checkout
└── app/          the git checkout, tracking origin/main
    └── .env      symlink to ../.env
```

The env file deliberately sits one level above the checkout, so
`git reset --hard` during a deploy cannot touch it. It is symlinked in because
Next and the Prisma CLI both read `.env` from the project root.

The app runs as the `it-network` system user, which has no login shell. It
cannot write anywhere except `/srv/it-network` (`ProtectSystem=strict` plus one
`ReadWritePaths`), and it holds no sudo rights.

---

## Deploying a change

```bash
git push origin main                          # from your machine
ssh azureuser@20.91.224.41 'sudo it-network-deploy'
```

`it-network-deploy` fetches `origin/main`, runs `npm ci`, applies migrations,
rebuilds, restarts the service, and fails loudly if the app does not answer 200
afterwards. Migrations run **before** the build, so code that needs a column is
never live before the column exists.

One caveat worth knowing: the build writes into the same `.next` directory the
running server is reading from. For the few seconds between the build finishing
and the restart, already-served HTML can reference chunk filenames that no
longer exist. At this traffic that is a better trade than the memory a second
build directory would cost — but it is why the restart follows immediately.

---

## Environment variables

Live in `/srv/it-network/.env`.

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | `postgresql://malikov:…@localhost:5432/malikov_dev` |
| `ADMIN_PASSWORD` | The `/admin` password |
| `ADMIN_SESSION_SECRET` | 32 random bytes as hex. `src/lib/auth.ts` refuses to boot without it, so the panel can never come up with an unsigned session cookie |
| `NEXT_PUBLIC_SITE_URL` | `https://it-network.uz`. **Read at build time** |
| `GEMINI_API_KEY` | Optional. Without any AI key the intake chat falls back to the scripted flow in `src/lib/ai/fallback.ts`, in all three languages |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | Alternatives; detection order is Gemini → OpenAI → Anthropic |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Optional. Pings you on each new request |

To change one:

```bash
ssh azureuser@20.91.224.41
sudo -u it-network nano /srv/it-network/.env
sudo systemctl restart it-network
```

A restart is enough for everything **except** `NEXT_PUBLIC_SITE_URL`, which is
inlined into the JavaScript bundle at build time. Changing that one needs
`sudo it-network-deploy`.

---

## Database

Postgres listens on localhost only; nothing reaches it from outside the machine.
The app connects as the `malikov` role, which owns `malikov_dev` and nothing
else. **These two kept their old names through the IT-Network rename** — they
are internal, never visible to anyone, and renaming a live role and database
buys nothing to weigh against the downtime. Read `malikov` here as "the app's
database role", not as anything to do with the domain.

```bash
sudo -u postgres psql malikov_dev            # a shell on the live database
sudo -u postgres psql -c '\l'                # what exists
```

Its config is tuned down in `/etc/postgresql/16/main/conf.d/low-memory.conf`:
20 connection slots and 96 MB of shared buffers, because Postgres is sharing
under a gigabyte with the application server rather than owning the box. The
app's own pool is capped at 5 in `src/lib/db.ts` for the same reason.

### Migrations

Applied automatically by `it-network-deploy`. By hand:

```bash
sudo -u it-network bash -c 'cd /srv/it-network/app && npx prisma migrate deploy'
```

Unlike the previous host, the Prisma CLI works fine here — it speaks the
Postgres wire protocol to localhost, so the ISP interference with port 5432 that
made this painful from a local machine is not in the path at all.

---

## Backups

`it-network-backup.timer` runs nightly with a randomised delay, writing
`pg_dump --clean` output gzipped to `/var/backups/it-network/`, keeping 14 days.
The script verifies the gzip and refuses to rotate older dumps if the new one is
implausibly small, so a silently broken backup cannot quietly eat the good ones.

```bash
sudo systemctl start it-network-backup        # run one now
sudo systemctl list-timers it-network-backup* # when the next one is due
ls -lh /var/backups/it-network/
```

Restore:

```bash
gunzip -c /var/backups/it-network/malikov_dev-YYYYMMDD-HHMMSS.sql.gz \
  | sudo -u postgres psql malikov_dev
```

**Read this part honestly: these dumps are on the same disk as the database.**
They protect against a bad migration, a mistaken `DELETE`, or a corrupted table.
They do not protect against losing the VM. If the intake requests matter — and
they are client leads, so they do — copy them off the box, either by pulling
them somewhere else on a schedule:

```bash
scp azureuser@20.91.224.41:/var/backups/it-network/\*.sql.gz ./backups/
```

or by taking Azure disk snapshots. Until one of those exists, a single failure
of this VM loses the database. Telegram notifications, if configured, are a
partial safety net — each request is also pushed to your phone as it arrives.

---

## TLS

certbot installed the certificate and its own renewal timer; renewal is
automatic and reloads nginx itself. To check:

```bash
sudo certbot certificates
sudo certbot renew --dry-run
systemctl is-active certbot.timer
```

nginx serves `/.well-known/acme-challenge/` from `/var/www/certbot` on disk, so
a renewal does not depend on the app being up.

---

## Firewall

`ufw` allows 22, 80 and 443, and denies everything else inbound. Azure's Network
Security Group has to agree with it — a rule can look correct in `ufw status`
and still be dropped a layer above, which is worth remembering before debugging
nginx for an hour. Postgres is not exposed in either place.

nginx answers `444` (close without a response) to any request whose `Host` is
none of the four real hostnames, so bare-IP scans and Host-header probes get
nothing rather than a default page. There is a `444` default block on port 80
and another on 443 — the TLS one needs a certificate of its own, since the
handshake has to complete before nginx can see the `Host` it is going to
reject.

Worth knowing when this bites you: a `444` is indistinguishable from a dead
site at the client. `curl` reports `(52) Empty reply from server` over HTTP and
`(56) server closed abruptly` over HTTPS, while `systemctl status nginx` says
everything is fine. If the site is unreachable but the box answers ping and
`nginx -t` passes, check that the hostname is actually in a `server_name`
before looking anywhere else.

---

## Operating it

```bash
# health
systemctl status it-network nginx postgresql
journalctl -u it-network -f                  # app logs
journalctl -u it-network -n 100 --no-pager

# nginx
sudo nginx -t && sudo systemctl reload nginx
sudo tail -f /var/log/nginx/{access,error}.log

# resources — the number that matters most on this box
free -m
systemd-cgtop -1 -n1
```

### Memory

897 MB, shared between Next (~75–150 MB), Postgres, nginx and the OS. A
`next build` does not fit in what is left, so there is a 2 GB swapfile at
`/swapfile` with `vm.swappiness=10`: the build spills into it instead of being
OOM-killed, at the cost of being slower. Do not remove it — deploys will start
failing in a way that looks like a build bug.

---

## What to check after a deploy

- `/en`, `/ru`, `/uz` all render and the language switcher moves between them.
- Submit a request through the chat, end to end.
- It appears at `/admin` — that is the actual proof the database is wired up.
- Accept it with a comment, and confirm the decision survives a refresh.
- View source on `/uz`: the canonical and `hreflang` tags must say
  `it-network.uz`. If they name any other host, `NEXT_PUBLIC_SITE_URL` was not
  set **at build time**.
- `/admin` returns `noindex` and is unreachable without the password.

---

## Renaming from malikov-dev (one-off)

The Postgres role and database keep their old names on purpose — see
**Database** above. Nothing here touches them.

Take a dump first, and pull it off the box before you start:

```bash
ssh azureuser@20.91.224.41
sudo systemctl start malikov-backup
ls -lh /var/backups/malikov-dev/
```

### Done: DNS, certificate, nginx, canonical tags

Steps 1, 2 and 5 of the original procedure have been carried out, along with
the `NEXT_PUBLIC_SITE_URL` change and the rebuild. The site serves on
`https://it-network.uz` with its own Let's Encrypt certificate
(`it-network.uz` + `www.it-network.uz`, separate from the old one), the old
hostnames `301` to the new, and every canonical and `hreflang` tag names
`it-network.uz`.

Two things did not go the way the original text assumed, and are worth knowing
before anyone reruns any of it:

- **`malikov-dev.uz` no longer resolves to this box** — it points at
  `91.212.89.6`. So the "one certificate over all four hostnames" command in
  the old step 2 *cannot* work: certbot proves ownership over HTTP against this
  machine, and the old names no longer arrive here. The new certificate covers
  the two new hostnames only. The `301` block for the old domain is kept as a
  safety net for anything still pinned to the old address, but nothing reaches
  it in practice, and the old certificate has no renewal path once the DNS is
  gone. **Decide deliberately whether to point `malikov-dev.uz` back here for
  the redirect, or let it go** — see **the old domain redirects** below.
- **`certbot --nginx` cloned the wrong server block.** With the new hostname
  absent from every `server_name`, it took the `return 444;` default block as
  its template, so it produced a TLS block for `it-network.uz` that held a
  valid certificate and `return 444;` — a correct handshake followed by a
  connection closed with no response. From outside this looks exactly like a
  broken site while `systemctl status nginx` reports everything healthy. The
  config was rewritten by hand afterwards; if you ever run `certbot --nginx`
  for a hostname nginx does not already serve, read the block it generated
  before trusting the reload.

### Done: the old domain redirects to the new one

The old hostnames are split out into a block that only redirects, so existing
links and anything already indexed keep working:

```nginx
server {
    listen 443 ssl;
    server_name malikov-dev.uz www.malikov-dev.uz;
    return 301 https://it-network.uz$request_uri;
}
```

`301`, not `302` — a search engine only moves the ranking across for a
permanent redirect.

**This block is currently unreachable**, and the old certificate can no longer
renew. `certbot renew --dry-run` reports it exactly:

```
Domain: www.malikov-dev.uz
Detail: DNS problem: NXDOMAIN looking up A for www.malikov-dev.uz
Domain: malikov-dev.uz
Detail: 91.212.89.6: Invalid response from
        http://malikov-dev.uz/.well-known/acme-challenge/… : 404
```

The apex points at `91.212.89.6` and the `www` record does not exist at all, so
certbot cannot prove ownership against this box. The `it-network.uz`
certificate renews cleanly in the same run; only the old one fails. Until this
is resolved, `certbot.timer` logs a renewal failure on every attempt — noise
rather than breakage, but it will not stop on its own, and the old certificate
lapses on 2026-10-29.

Two ways out, and it is a judgement call about the old name, not a technical
one:

- **Keep it.** Point `malikov-dev.uz` `A` at `20.91.224.41` and add the `www`
  record. The redirect starts working, the certificate renews, old links and
  any accumulated ranking survive.
- **Drop it.** Delete the old certificate and this `server` block together —
  `sudo certbot delete --cert-name malikov-dev.uz`, then remove the block and
  reload. **In that order the block must go before the reload**: nginx refuses
  to start with a `ssl_certificate` path that no longer exists, so deleting the
  certificate and reloading without editing the config takes the site down.

The `444` default blocks — one on `80`, one on `443` — are the last two
`server` entries in the file. An unknown `Host` on either port gets the
connection closed with no response.

### Still to do: rename on disk and in systemd

```bash
sudo systemctl stop malikov-dev malikov-backup.timer

sudo usermod  -l it-network malikov   # login name only — uid and gid unchanged
sudo groupmod -n it-network malikov
sudo mv /srv/malikov-dev /srv/it-network
sudo mv /var/backups/malikov-dev /var/backups/it-network
sudo chown -R it-network:it-network /srv/it-network

cd /etc/systemd/system
sudo mv malikov-dev.service    it-network.service
sudo mv malikov-backup.service it-network-backup.service
sudo mv malikov-backup.timer   it-network-backup.timer
sudo mv /usr/local/bin/malikov-deploy /usr/local/bin/it-network-deploy
```

`usermod -l` changes the name and nothing else, so every file the app owns is
still owned by it afterwards. It refuses to run while a process of that user is
alive — that is what the `stop` on the first line is for.

### Still to do: edit what those files say inside

Renaming the files is only half of it: each one still carries the old paths in
its contents. Open each and replace `malikov-dev` with `it-network`,
`/srv/malikov-dev` with `/srv/it-network`, `/var/backups/malikov-dev` with
`/var/backups/it-network`, and `User=`/`Group=` with `it-network`. The timer's
`Unit=` has to name the renamed service. **Leave every `malikov_dev` and the
`malikov` in `DATABASE_URL` exactly as they are** — those are the database.

The nginx side has two more of these than the original list admitted: the site
file is still `sites-available/malikov-dev` (with its symlink in
`sites-enabled/`), and it `include`s `snippets/malikov-proxy.conf` and
`snippets/malikov-headers.conf`. Rename the snippets and the site file together
with the `include` lines that name them, or leave all four alone — a half-done
rename here is what takes the site down.

```bash
sudo grep -rn 'malikov-dev\|/srv/malikov\|=malikov$' \
  /etc/systemd/system/it-network.service \
  /etc/systemd/system/it-network-backup.service \
  /etc/systemd/system/it-network-backup.timer \
  /usr/local/bin/it-network-deploy \
  /etc/nginx/sites-available/ /etc/nginx/snippets/
```

That has to come back empty before you go on. `NEXT_PUBLIC_SITE_URL` is already
set to `https://it-network.uz` — leave it.

### Still to do: restart under the new names

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now it-network it-network-backup.timer
sudo nginx -t && sudo systemctl reload nginx
sudo it-network-deploy
```

The deploy at the end is no longer needed for `NEXT_PUBLIC_SITE_URL` — that
build has already run. It is here because `npm ci` and the build have to happen
under the renamed user and path before the service is trusted again.

### Check

```bash
systemctl status it-network it-network-backup.timer
curl -sI https://it-network.uz/uz | head -1     # 200
curl -s  https://it-network.uz/uz | grep -o 'rel="canonical"[^>]*'
sudo systemctl start it-network-backup && ls -lh /var/backups/it-network/
```

Then walk the list in **What to check after a deploy**.

If it goes wrong, all of what remains is a rename: `usermod -l`, the `mv`s and
the nginx block all reverse the same way round. The one step that does not is
the build, and `sudo it-network-deploy` simply runs it again.

### Elsewhere, off the server

- The GitHub repo is still `malikov07/malikov-dev`. Renaming it is safe —
  GitHub redirects the old URL, so a deploy mid-rename still fetches — but
  update the remote afterwards on both machines:
  `git remote set-url origin <new-url>`, and the checkout's remote in
  `/srv/it-network/app` too.
- The local clone is in a `malikov_dev` directory. Nothing reads that name; it
  is only cosmetic.
- Instagram: the handle and the rendered assets in `brand/instagram/` both name
  the old domain. The assets are regenerated from the HTML in that directory.

---

## Known limits

- **One machine, no redundancy.** A reboot is a few seconds of downtime; losing
  the VM loses the site and, without off-box backups, the database. Everything
  is `enabled` in systemd, so a reboot recovers on its own.
- **The rate limiter is in-memory** (`src/lib/rate-limit.ts`). This is now
  *correct* rather than merely acceptable — one long-lived process means one
  counter, which is what the code always assumed. It still resets on restart.
- **Builds happen on the production machine**, competing with the running site
  for two cores. It is brief, and it is the price of not maintaining a registry.
- **No offsite backup yet.** Called out above, repeated here because it is the
  one thing on this list that will hurt.
