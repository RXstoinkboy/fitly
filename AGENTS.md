# Fitly — Virtual Try-On App

## Tech Stack

- **Monorepo**: Turborepo (npm workspaces, npm@11)
- **Mobile**: Expo SDK 55 (RN 0.83) + Expo Router (file-based routing) + Tamagui UI v2 + Legend-State (persisted state) + TanStack Query v5 (API data) + RevenueCat (subscriptions) + PostHog (analytics)
- **Backend**: AdonisJS v6 (Node.js ESM) + PostgreSQL (Lucid ORM) + Google GenAI SDK (image generation)
- **Auth**: Anonymous access tokens via `@adonisjs/auth` (DbAccessTokensProvider, scrypt hashing)
- **Dev**: TypeScript 5.8+, ESLint, Prettier, tsx (watch mode)

## Project Structure

```
/
├── apps/
│   ├── mobile/          # Expo React Native app (Expo Router)
│   │   ├── app/         # File-based routes
│   │   │   ├── (tabs)/  # Main tabs (home, gallery, settings)
│   │   │   ├── onboarding/  # Pre-auth flow
│   │   │   ├── image-detail/[id].tsx
│   │   │   ├── model-detail/[id].tsx
│   │   │   ├── models-gallery.tsx
│   │   │   └── _layout.tsx  # Root layout + providers
│   │   ├── components/
│   │   │   ├── v2/ui/   # Reusable UI primitives (Tamagui-based)
│   │   │   ├── v2/domain/  # Domain-specific components (generate, select-garment)
│   │   │   ├── gallery/    # Gallery components
│   │   │   ├── modals/     # Modal components
│   │   │   └── subscription/  # Paywall/subscription UI
│   │   ├── screens/     # Orchestrator screen components
│   │   ├── queries/     # TanStack Query definitions
│   │   │   ├── image-generation/
│   │   │   ├── auth/
│   │   │   └── subscription/
│   │   ├── state/       # Legend-State store (persisted to MMKV)
│   │   ├── lib/         # Business logic
│   │   │   ├── analytics/  # PostHog event tracking
│   │   │   ├── subscription/  # RevenueCat
│   │   │   ├── garments/
│   │   │   └── onboarding/
│   │   ├── context/     # React context providers
│   │   ├── hooks/       # Custom hooks
│   │   ├── utils/       # Utilities (camera, file system, IDs)
│   │   └── constants/   # Dimensions, paths
│   └── backend/         # AdonisJS v6 API
│       ├── app/
│       │   ├── controllers/
│       │   │   ├── auth_controller.ts          # POST /auth/anonymous
│       │   │   └── image_generation_controller.ts  # POST /images/generate
│       │   ├── middleware/
│       │   │   ├── auth_middleware.ts
│       │   │   ├── api_key_middleware.ts
│       │   │   ├── installation_id_middleware.ts
│       │   │   └── exception_handler.ts
│       │   ├── models/
│       │   │   └── user.ts
│       │   ├── validators/
│       │   │   └── image_generation_validator.ts
│       │   └── types/
│       ├── config/      # AdonisJS config (app, auth, cors, db, hash, logger)
│       ├── database/
│       │   └── migrations/
│       ├── start/       # AdonisJS boot
│       │   ├── routes.ts
│       │   ├── env.ts
│       │   └── kernel.ts
│       └── docker-compose.yml  # PostgreSQL
├── package.json         # Root workspace config
└── turbo.json           # Turborepo task definitions
```

## Routes & Navigation (Mobile)

| Route | Auth | Description |
|-------|------|-------------|
| `/onboarding/welcome` | !onboarded | Welcome screen |
| `/onboarding/select-user-photo` | !onboarded | Upload model photo |
| `/onboarding/select-garments` | !onboarded | Pick garments to try on |
| `/onboarding/finish` | !onboarded | Done, enter app |
| `/(tabs)/index` | onboarded | Home — generate try-on |
| `/(tabs)/gallery` | onboarded | Generated images gallery |
| `/(tabs)/settings` | onboarded | Settings/profile |
| `/models-gallery` | onboarded | Browse available models |
| `/model-detail/[id]` | all* | Model detail (modal, iOS context menu) |
| `/image-detail/[id]` | all* | Image detail (modal, zoom) |

## API Endpoints (Backend — `/api/v1`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/anonymous` | installationId | Create anonymous user, return token |
| POST | `/images/generate` | installationId + token | Generate AI try-on image |
| GET | `/health` | none | DB healthcheck (SELECT 1) |

## State Architecture (Mobile)

- **Legend-State** (`state/`): Persistent app data — models, garments, generated images, onboarding progress. Synced to MMKV.
- **TanStack Query** (`queries/`): API data — auth tokens, generation requests/results, subscription status.
- **React Context** (`context/`): Garments provider (active selection state).
- **Zustand**: Available but not a primary store; use Legend-State for persistent data.

## Key Conventions

### Code Style
- TypeScript with strict types, explicit `declare` for class fields
- React Native 0.83 / Expo Router file-based routing
- Tamagui v2 for all UI — use components from `components/v2/ui/` (never raw RN views)
- Import aliases: `@/` → `apps/mobile/`

### Component Organization
- **Screens** (`screens/`): Full-screen components that compose route logic with UI
- **UI primitives** (`components/v2/ui/`): Reusable, styled, Tamagui-based atoms
- **Domain components** (`components/v2/domain/`): Feature-specific (generate-image-button, select-garment)
- **Modals** (`components/modals/`): Action sheets, photo selection, guidelines

### API Layer (Mobile)
- Backend calls go through `queries/` using TanStack Query
- `queries/backend-headers.ts` sets auth + installation-id headers
- Each domain (auth, image-generation, subscription) has `api.ts` + `keys.ts` + `mutation.ts`/`use-*.ts`

### Commits
- Conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- Branch naming: `feat/description`, `fix/description`, `refactor/description`

### Root Tasks (Turborepo)
```bash
npm run dev        # Start all apps in dev mode
npm run build      # Build all apps
npm run lint       # Lint all apps
npm run type-check # TypeScript check all apps
```

## Critical Rules for Changes

1. **DO NOT** add new dependencies without asking — the mobile app is already heavy
2. **DO NOT** remove or rename files in `app/` without updating routes in `_layout.tsx` and `ROUTES.md`
3. **DO NOT** break the Legend-State store schema — it's persisted to MMKV and migration is manual
4. **TEST** — there are no automated test suites yet, so verify manually or keep changes minimal and safe
5. **UI** — always use Tamagui components from `components/v2/ui/`; never raw `react-native` Views/Text
6. **Analytics** — new user-facing features must add PostHog events via `lib/analytics/`
7. **Subscriptions** — any gating logic uses `lib/subscription/` and `components/subscription/`
8. **Backend env vars** — documented in `apps/backend/.env.example`; never hardcode secrets
9. **Mobile env vars** — documented in `apps/mobile/.env.example`; prefix with `EXPO_PUBLIC_`

## Common Tasks

### Run mobile app
```bash
cd apps/mobile && npm run dev
```

### Run backend
```bash
cd apps/backend && npm run db   # Start PostgreSQL via Docker
cd apps/backend && npm run dev  # Start dev server with hot reload
```

### Run backend DB migration
```bash
cd apps/backend && npm run ace migration:run
```

### Lint
```bash
cd apps/mobile && npm run lint
cd apps/backend && npm run lint
```