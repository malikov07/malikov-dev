# Deployment

The site runs on a single Ubuntu 24.04 VM that also holds its database. No
platform, no managed services, nothing to bill by the request.

> The Postgres role, the database and the GitHub repo are still named for
> `malikov`. That is deliberate — see **The rename from malikov-dev** at the
> end of this file. Everything else on the box is `it-network`.

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

Swap alone is not enough, though: Node caps its own heap at about half the
physical RAM (~450 MB here) and dies with "JavaScript heap out of memory" long
before it would touch swap. So `npm run build` raises the cap with
`NODE_OPTIONS=--max-old-space-size=1536`, which is what lets the build actually
use the swapfile. The three.js type definitions were what first pushed the
type-check step over the default cap.

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

## The rename from malikov-dev

Done on 2026-08-26. The box, the domain and the site all say IT-Network now.
These stayed on the old name deliberately:

- **The Postgres role `malikov` and the database `malikov_dev`** — internal,
  never user-visible, and not worth the downtime. The nightly dumps are still
  named `malikov_dev-*.sql.gz` for the same reason. See **Database** above.
- **The GitHub repo `malikov07/malikov-dev`**, which is why
  `it-network.service` carries that URL in `Documentation=`. Renaming it is
  safe — GitHub redirects the old URL, so a deploy mid-rename still fetches —
  but update the remote afterwards on both machines: `git remote set-url origin
  <new-url>`, and the checkout's remote in `/srv/it-network/app` too.
- **The box's hostname, still `malikov`.** `hostnamectl set-hostname` alone
  will not hold it: `/etc/cloud/cloud.cfg` sets `preserve_hostname: false`, so
  cloud-init rewrites it from Azure metadata on every boot. Making it stick
  needs a drop-in with `preserve_hostname: true`. Cosmetic — it appears in
  `journalctl` output and nowhere a user can see.
- **The local clone's `malikov_dev` directory.** Nothing reads that name.
- **Instagram**: the handle still names the old domain. The rendered assets in
  `brand/instagram/` have been redrawn; they are regenerated from the HTML in
  that directory.

### malikov-dev.uz is gone

The old domain was lost rather than retired. Its certificate is deleted and its
nginx redirect block removed, so nothing here answers to it. There is no path
from the old name to this site any more — an old link now reaches whoever
registers the domain next.

### Two things that bit on the way, worth knowing before the next one

- **`certbot --nginx` clones whatever block it can find.** Asked for a hostname
  that appeared in no `server_name`, it used the `return 444;` default block as
  its template and produced a TLS block holding a valid certificate *and*
  `return 444;` — a correct handshake, then a connection closed with no
  response. From outside that is indistinguishable from a dead site, while
  `systemctl status nginx` and `nginx -t` both report everything healthy. If
  you ever run `certbot --nginx` for a name nginx does not already serve, read
  the block it wrote before trusting the reload.
- **The `.env` symlink was absolute.** It pointed at `/srv/malikov-dev/.env`,
  not `../.env` as this file used to claim, so moving the directory left it
  dangling — and a dangling `.env` means no `DATABASE_URL`, which the app only
  finds out at boot. It is relative now, so the next move cannot break it.

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
