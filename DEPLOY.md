# Deployment

The site runs on a single Ubuntu 24.04 VM that also holds its database. No
platform, no managed services, nothing to bill by the request.

| | |
| --- | --- |
| Host | `20.91.224.41` — Ubuntu 24.04, 2 vCPU, 897 MB RAM, 29 GB disk |
| Domain | `malikov-dev.uz` and `www.malikov-dev.uz`, apex `A` + `www` `CNAME` |
| TLS | Let's Encrypt via certbot, renewed by `certbot.timer` |
| Web server | nginx, terminating TLS and proxying to loopback |
| App | Next 16 under systemd as `malikov-dev.service`, on `127.0.0.1:3000` |
| Database | Postgres 16 on the same machine, over localhost |
| SSH | `ssh azureuser@20.91.224.41` |

## Layout on disk

```
/srv/malikov-dev/
├── .env          secrets, 0600, owned by the app user — OUTSIDE the checkout
└── app/          the git checkout, tracking origin/main
    └── .env      symlink to ../.env
```

The env file deliberately sits one level above the checkout, so
`git reset --hard` during a deploy cannot touch it. It is symlinked in because
Next and the Prisma CLI both read `.env` from the project root.

The app runs as the `malikov` system user, which has no login shell. It cannot
write anywhere except `/srv/malikov-dev` (`ProtectSystem=strict` plus one
`ReadWritePaths`), and it holds no sudo rights.

---

## Deploying a change

```bash
git push origin main                          # from your machine
ssh azureuser@20.91.224.41 'sudo malikov-deploy'
```

`malikov-deploy` fetches `origin/main`, runs `npm ci`, applies migrations,
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

Live in `/srv/malikov-dev/.env`.

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | `postgresql://malikov:…@localhost:5432/malikov_dev` |
| `ADMIN_PASSWORD` | The `/admin` password |
| `ADMIN_SESSION_SECRET` | 32 random bytes as hex. `src/lib/auth.ts` refuses to boot without it, so the panel can never come up with an unsigned session cookie |
| `NEXT_PUBLIC_SITE_URL` | `https://malikov-dev.uz`. **Read at build time** |
| `GEMINI_API_KEY` | Optional. Without any AI key the intake chat falls back to the scripted flow in `src/lib/ai/fallback.ts`, in all three languages |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | Alternatives; detection order is Gemini → OpenAI → Anthropic |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Optional. Pings you on each new request |

To change one:

```bash
ssh azureuser@20.91.224.41
sudo -u malikov nano /srv/malikov-dev/.env
sudo systemctl restart malikov-dev
```

A restart is enough for everything **except** `NEXT_PUBLIC_SITE_URL`, which is
inlined into the JavaScript bundle at build time. Changing that one needs
`sudo malikov-deploy`.

---

## Database

Postgres listens on localhost only; nothing reaches it from outside the machine.
The app connects as the `malikov` role, which owns `malikov_dev` and nothing
else.

```bash
sudo -u postgres psql malikov_dev            # a shell on the live database
sudo -u postgres psql -c '\l'                # what exists
```

Its config is tuned down in `/etc/postgresql/16/main/conf.d/low-memory.conf`:
20 connection slots and 96 MB of shared buffers, because Postgres is sharing
under a gigabyte with the application server rather than owning the box. The
app's own pool is capped at 5 in `src/lib/db.ts` for the same reason.

### Migrations

Applied automatically by `malikov-deploy`. By hand:

```bash
sudo -u malikov bash -c 'cd /srv/malikov-dev/app && npx prisma migrate deploy'
```

Unlike the previous host, the Prisma CLI works fine here — it speaks the
Postgres wire protocol to localhost, so the ISP interference with port 5432 that
made this painful from a local machine is not in the path at all.

---

## Backups

`malikov-backup.timer` runs nightly with a randomised delay, writing
`pg_dump --clean` output gzipped to `/var/backups/malikov-dev/`, keeping 14 days.
The script verifies the gzip and refuses to rotate older dumps if the new one is
implausibly small, so a silently broken backup cannot quietly eat the good ones.

```bash
sudo systemctl start malikov-backup          # run one now
sudo systemctl list-timers malikov-backup*   # when the next one is due
ls -lh /var/backups/malikov-dev/
```

Restore:

```bash
gunzip -c /var/backups/malikov-dev/malikov_dev-YYYYMMDD-HHMMSS.sql.gz \
  | sudo -u postgres psql malikov_dev
```

**Read this part honestly: these dumps are on the same disk as the database.**
They protect against a bad migration, a mistaken `DELETE`, or a corrupted table.
They do not protect against losing the VM. If the intake requests matter — and
they are client leads, so they do — copy them off the box, either by pulling
them somewhere else on a schedule:

```bash
scp azureuser@20.91.224.41:/var/backups/malikov-dev/\*.sql.gz ./backups/
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
neither of the two real hostnames, so bare-IP scans and Host-header probes get
nothing rather than a default page.

---

## Operating it

```bash
# health
systemctl status malikov-dev nginx postgresql
journalctl -u malikov-dev -f                 # app logs
journalctl -u malikov-dev -n 100 --no-pager

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
  `malikov-dev.uz`. If they say `malikov.dev`, `NEXT_PUBLIC_SITE_URL` was not
  set **at build time**.
- `/admin` returns `noindex` and is unreachable without the password.

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
