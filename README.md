# Virtual Try-On (Fitly)

A Turborepo monorepo for the Fitly AI-powered virtual garment try-on app.

## Structure

```
apps/
  mobile/    — React Native / Expo mobile app
  backend/   — AdonisJS v6 API server (image generation)
```

## Getting Started

```bash
# Install all dependencies from the root
npm install

# Start all apps in development mode
npm run dev

# Or start individual apps
cd apps/mobile && npm run start
cd apps/backend && npm run dev
```

## Apps

### `apps/mobile`

Expo/React Native app. See `apps/mobile/ROUTES.md` for route details.

**Env vars** (copy `apps/mobile/.env.example` to `apps/mobile/.env`):

- `EXPO_PUBLIC_API_URL` — Backend URL (use your machine's LAN IP for physical devices, e.g. `http://192.168.1.x:3333`)
- `EXPO_PUBLIC_API_KEY` — Optional API key matching the backend `API_KEY`
- `EXPO_PUBLIC_POSTHOG_API_KEY` — PostHog project API key (use placeholder until provided)
- `EXPO_PUBLIC_POSTHOG_HOST` — PostHog host (use `https://us.i.posthog.com` for cloud)
- Mobile requests also include `x-installation-id` automatically (generated once per app install)

### `apps/backend`

AdonisJS v6 REST API. See `apps/backend/README.md` for full setup instructions.

**Env vars** (copy `apps/backend/.env.example` to `apps/backend/.env`):

- `GOOGLE_API_KEY` — Google GenAI API key
- `APP_KEY` — 32-byte random hex secret
- `API_KEY` — Optional request authentication key
