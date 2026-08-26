# Deploying the backend to an OVHcloud VPS

Migrates the whole backend stack — app **and** database — off Railway + Neon
onto a single VPS running Docker Compose:

```
Internet ──► VPS (Ubuntu)
              ├── Caddy          :80/:443 → automatic HTTPS (Let's Encrypt)
              ├── backend app    node build/bin/server.js (port 3333, internal)
              └── PostgreSQL 18  data in a named Docker volume
```

Everything below happens on the VPS as root, unless noted.

---

## 1. Buy / provision the VPS

- **OVHcloud VPS** (or any VPS): 2 vCPU / 4 GB RAM / 40 GB SSD is plenty.
- OS image: **Ubuntu 24.04 LTS**.
- Note the public IPv4 from the control panel.

## 2. Point a domain at the VPS (needed for HTTPS)

Caddy gives you a free TLS cert automatically, but it needs a real domain.

1. In your DNS provider, add an **A record**:
   `api.yourdomain.com` → `<VPS IPv4>`
2. Wait for propagation: `dig +short api.yourdomain.com` should show the VPS IP.

No domain? You can temporarily run on plain http (see "No domain yet" at the
bottom) — but real devices need HTTPS, so get the domain before releasing.

## 3. Open the firewall — both layers

**Layer 1 — OVHcloud control panel** (VPS → Firewall / security config):

| Port | Protocol | Purpose        |
|------|----------|----------------|
| 22   | TCP      | SSH            |
| 80   | TCP      | HTTP (Caddy)   |
| 443  | TCP      | HTTPS (Caddy)  |

Do **not** open 3333 or 5432 — they stay internal.

**Layer 2 — ufw inside the VPS**:

```bash
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw enable
```

## 4. SSH in and install Docker

```bash
ssh root@<VPS-IP>
curl -fsSL https://get.docker.com | sh
docker --version && docker compose version
```

## 5. Get the code

```bash
apt install -y git
git clone https://github.com/RXstoinkboy/fitly.git /opt/fitly
cd /opt/fitly/apps/backend
git checkout infra/docker-production   # the branch with the Docker setup
```

## 6. Create `.env.production`

This is where **all secrets from your current `.env` live**. The file stays
on the VPS only — it is git-ignored and excluded from the Docker image.

```bash
cp .env.production.example .env.production
nano .env.production
```

| Variable | How to get it |
|----------|---------------|
| `APP_KEY` | `openssl rand -hex 16` (new random value is fine) |
| `DOMAIN` | `api.yourdomain.com` from step 2 |
| `GOOGLE_API_KEY` | copy from your current `.env` (Railway) |
| `API_KEY` | new random string — see "Mobile app" step below |
| `REVENUECAT_*` | copy the 3 values from your current `.env` |
| `DB_PASSWORD` | `openssl rand -base64 32` |
| rest | leave as-is (`DB_HOST=db`, `DB_SSL=false` are correct) |

## 7. Build and start

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

First build takes a few minutes (npm install). Then check health:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
curl https://api.yourdomain.com/api/v1/health
# → {"status":"ok","db":"ok"}
```

The health check already confirms the app can talk to the database.

## 8. Move your data from Neon

The dump comes straight from Neon and pipes into the local Postgres — no
intermediate files needed. Stop the app first so nothing writes during the
copy:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml stop app

NEON_URL='postgresql://USER:PASSWORD@your-host.aws.neon.tech/DB?sslmode=require'
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T db sh -c \
  'pg_dump --no-owner --no-acl "$0" | psql -U postgres -d virtual_try_on' "$NEON_URL"

docker compose --env-file .env.production -f docker-compose.prod.yml start app
```

- `NEON_URL`: Neon dashboard → your project → **Connect** → copy the
  `postgresql://` connection string and append `?sslmode=require`.
- If you run a *second* restore later, drop the local DB first: `docker
  compose ... exec -T db psql -U postgres -c 'DROP DATABASE IF EXISTS virtual_try_on WITH (FORCE); CREATE DATABASE virtual_try_on;'`

Skipping the Neon dump (fresh start)? Run migrations instead:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm app \
  node ace migration:run --force
```

## 9. Verify end to end

```bash
# health + DB
curl https://api.yourdomain.com/api/v1/health

# anonymous auth round-trip (should return a token)
curl -X POST https://api.yourdomain.com/api/v1/auth/anonymous \
  -H 'Content-Type: application/json' -H 'x-installation-id: test-123' -d '{}'
```

Then open the app on a phone (see step 11) and generate one image.

## 10. Update RevenueCat

In the RevenueCat dashboard → **Integrations / Webhooks**, change the webhook
URL to:

```
https://api.yourdomain.com/api/v1/webhooks/revenuecat
```

## 11. What changes in the mobile app

No code changes — only build-time env vars:

| Mobile var | New value |
|------------|-----------|
| `EXPO_PUBLIC_API_URL` | `https://api.yourdomain.com` (no trailing slash) |
| `EXPO_PUBLIC_API_KEY` | the same value you put in backend `API_KEY` — only if you set one; leave both empty to run without |

`EXPO_PUBLIC_*` vars are **inlined at build time**, so:

- **Dev/test builds**: edit `apps/mobile/.env`, then restart Expo with
  `npx expo start -c` and rebuild the dev client.
- **EAS builds**: set the values in your EAS build profile
  (`eas.json` → `env:`) or as EAS secrets, then `eas build --profile production`.
- **If the app is published to the stores**: ship the new build as an update
  (old builds still point at Railway).

PostHog and RevenueCat SDK keys are unchanged.

## 12. Backups (do this before you delete Neon!)

Daily dump to the VPS disk, keep the last 7:

```bash
mkdir -p /var/backups/fitly
crontab -e   # add:
0 3 * * * cd /opt/fitly/apps/backend && docker compose --env-file .env.production -f docker-compose.prod.yml exec -T db pg_dump -U postgres -d virtual_try_on | gzip > /var/backups/fitly/db-$(date +\%F).sql.gz && find /var/backups/fitly -name '*.gz' -mtime +7 -delete
```

Also copy a dump off the VPS occasionally (scp the file to your machine or
push it to OVH object storage).

## 13. Decommission Railway + Neon

After the app works in production for a few days:

1. Railway: delete the backend service/project.
2. Neon: delete the project (keep it paused a week if you're nervous).
3. Rotate anything that lived only on Railway.

## 14. Deploying updates later

```bash
cd /opt/fitly && git pull
cd apps/backend && docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
# after schema changes:
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm app node ace migration:run --force
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `curl https://...` hangs / connection refused | OVH firewall or ufw blocking 80/443 — re-check step 3 |
| Caddy cert error in logs | DNS A record not propagated yet (`dig +short api.yourdomain.com`); also make sure DOMAIN in `.env.production` is set |
| `/health` returns 503 | app can't reach Postgres — check `DB_PASSWORD`/`DB_SSL=false`, `logs -f db` |
| App crash-looping, `E_MISSING_ENV...` in `logs -f app` | a required var is missing/empty in `.env.production` — re-run `up -d` after editing |
| `E_INVALID_ENV_VARIABLES` | a var has the wrong format (e.g. `DOMAIN` with a scheme — no `https://` prefix) |
| Migrations needed after restore? | No — the Neon dump already includes schema + `adonis_schema` bookkeeping |

## No domain yet (temporary)

Edit `docker-compose.prod.yml`: change the app's port binding to
`"3333:3333"`, open 3333 in the firewalls, and set
`EXPO_PUBLIC_API_URL=http://<VPS-IP>:3333` in the app. **This is test-only** —
Android/iOS production builds block cleartext http, and there's no TLS.
Switch to the domain + Caddy setup before any real release.
