# Fitly Mobile — Vertical Slice Architecture (VSA) Refactor Plan

Date: 2026-08-11
Scope: `apps/mobile` (Expo SDK 55 / RN 0.83). Backend (`apps/backend`) explicitly out of scope except for a short note.
Status: ANALYSIS + PLAN ONLY. No code changes are made by this document.

Method note: every "dead" claim below was verified with a repo-wide symbol search over `apps/mobile`. Where a symbol is "unused" it means: zero references outside its own definition (and outside other files that are themselves dead). Search evidence is cited per item.

---

## 1. Executive summary

`apps/mobile` is a ~130-source-file Expo app organized by *technical layer* (`components/`, `screens/`, `queries/`, `state/`, `lib/`, `hooks/`, `utils/`, `context/`, `constants/`, `icons/`). The codebase is small enough that the layers don't hurt yet, but three concrete problems are already visible:

1. **Dead and legacy code is accumulating.** `components/ui-legacy/` is 6 files of which 4 have zero references and 1 is only reachable through a barrel that also re-exports `v2/` files (layering inversion). `context/garment-context.tsx` mounts a provider in the root layout whose context is *never consumed*. 3 of 8 `utils/` files are unreferenced. The Legend-State store ships a full `outfits` entity (type + collection + computed + reset wiring) that no component touches, plus ~12 actions/hooks with no consumers.
2. **The state module is a god-object.** One 693-line `state/store.ts` owns 7 distinct concerns (models, garments, selection, generated images, outfits, onboarding, auth) with a flat `state.actions.*` namespace that screens and queries poke directly (`state.store.models[id].get()` in route files, `state.actions.removeGarment(...)` in `app/image-detail/[id].tsx`, etc.).
3. **Import conventions are already drifting.** `home-screen.tsx` imports `ImagesCarousel` from `@/components/ui-legacy` even though the component lives in `components/v2/`; `settings-screen.tsx` imports `ScrollView, YGroup` straight from `tamagui` bypassing the design-system wrapper; `photo-guidelines-sheet.tsx` imports `ListItem, YGroup` from `tamagui` while a `v2/ui/list-item` wrapper exists; three files import lucide icons from `@tamagui/lucide-icons` directly instead of `@/icons`.

The proposal is a classic VSA layout under `apps/mobile/src/`:

- `src/features/<domain>/` — one folder per business domain (onboarding, auth, models, garments, generation, gallery, subscription, settings), each owning its `components/`, `screens/`, `queries/`, `state/`, `hooks/`, `lib/`, `assets/` as needed.
- `src/shared/` — only truly cross-cutting code: the Tamagui design system (`ui/`), icons, analytics, API/query infrastructure, fs/media utils, storage paths.
- `app/` — stays in place (expo-router file-based routing), reduced to thin route files that compose feature slices.
- Legend-State is split **at the code level first** (per-domain state modules composed into the same single persisted store, same MMKV key, same shape — zero data-migration risk), with an optional **persistence-level split later** behind an explicit one-time migration.

The refactor is sequenced so the app stays shippable throughout (it is in Google Play closed testing): Phase 0 deletes dead code, Phase 1 builds the shared foundation, Phase 2 extracts one domain at a time (smallest risk first), Phase 3 splits the state facade and cleans routes. Every phase ends with a verification gate: `tsc --noEmit` → `eslint` → `npx expo export` (bundle smoke test).

**Headline numbers** (details in §4):

- ~129 source files analyzed in `apps/mobile` (+23 asset files, +backend skim).
- 19 source files recommended for deletion, 15 asset files, 1 stale doc (`ROUTES.md`) to rewrite.
- ~20 dead exports/actions/hooks to prune from live files (`state/`, `lib/subscription/`, `hooks/`).
- 6 confirmed dead npm dependencies + ~9 more candidates to verify.

---

## 2. Domains map

Domains identified by walking every route, screen, query, store slice and lib module. Each domain lists its current files (all paths relative to `apps/mobile/`).

### 2.1 `onboarding` — first-run flow (welcome → photo → garments → finish)

| Current file | Role |
|---|---|
| `app/onboarding/_layout.tsx` | Stack + resume-step redirect (reads `useOnboarding`) |
| `app/onboarding/welcome.tsx`, `select-user-photo.tsx`, `select-garments.tsx`, `finish.tsx` | Thin route wrappers → screens |
| `screens/onboarding/welcome-screen.tsx` | Carousel of example generations + CTA |
| `screens/onboarding/select-user-photo-screen.tsx` | Model photo capture/select + crop + guidelines |
| `screens/onboarding/select-garments-screen.tsx` | Garment pick + first generation trigger |
| `screens/onboarding/finish-screen.tsx` | Shows generated result, presents paywall, completes onboarding |
| `components/modals/photo-guidelines-sheet.tsx` | Guidelines sheet + `usePhotoGuidelinesSheet` + `PhotoGuidelinesInfoButton` (only used by select-user-photo-screen) |
| `hooks/use-image-size.tsx` | 80%-width 3:2 sizing — only used by the 4 onboarding screens |
| `state` slice: `onboarding.{isCompleted,currentStep}` + `completeOnboarding`/`setOnboardingStep`/`resetOnboarding` | Persisted onboarding progress |
| `assets/images/generation-examples/1..6.png` | Welcome carousel + guidelines example |
| `lib/onboarding/types.ts`, `lib/onboarding/constants.ts` | DEAD (see §4) |
| `lib/storage-keys.ts` (partially) | Only `PHOTO_GUIDELINES_SEEN_KEY` is actually used |

Notes: onboarding also *uses* models/garments/generation/subscription capabilities (addModel, useSelectGarment, useGenerateImageMutation, usePaywall) — in VSA it imports those features' public APIs; the features must not import back from onboarding.

### 2.2 `auth` — anonymous auth + installation identity

| Current file | Role |
|---|---|
| `queries/auth/api.ts` | `getOrCreateAuthIdentity`, `getOrCreateToken`, `clearAuthIdentity`; syncs RevenueCat app user |
| `queries/backend-headers.ts` | Builds `x-installation-id` / `Authorization` / `x-api-key` headers (shared API infra, auth-dependent) |
| `state` slice: `auth.{token,userId,installationId}` + `setAuthIdentity`/`clearAuthIdentity`/`getOrCreateInstallationId` (+4 dead setters) | Persisted credentials |

Notes: no `keys.ts`/`index.ts` under `queries/auth/` (inconsistent with the other query domains — AGENTS.md claims each domain has `api.ts` + `keys.ts`). Consumed by `lib/analytics/provider.tsx` (identify), `queries/image-generation/api.ts` (token), `queries/backend-headers.ts` (installation id).

### 2.3 `models` — user's model photos ("the person wearing the clothes")

| Current file | Role |
|---|---|
| `state` slice: `models` collection + `preferences.selectedModelId` + `addModel`/`setCurrentModel`/`deleteModelPermanently` (+2 dead actions) + `useModels`/`useCurrentModel` | Persisted model library |
| `screens/models-gallery-screen.tsx` + `app/models-gallery.tsx` | Browse all models |
| `app/model-detail/[id].tsx` | Model preview modal, "Use this model" (reuses gallery's `ImageDetailContent`) |
| `components/modals/change-model-sheet.tsx` | Camera/library/gallery chooser (used by settings) |
| Model parts of `screens/settings-screen.tsx` | Current-model display, add/crop/set-current flow |
| `constants/paths.ts` → `paths.fileSystem.models` | fs storage layout |

### 2.4 `garments` — clothing items + try-on selection

| Current file | Role |
|---|---|
| `state` slice: `garments.{top,bottom,dress,outerwear}` + `ui.selectedGarmentIds` (ephemeral) + add/remove/toggle/clear actions + `useGarments`/`useTopGarments`/`useBottomGarments`/`useDressGarments`/`useOuterwearGarments`/`useSelectedGarments` | Persisted garment library + ephemeral selection |
| `components/v2/domain/select-garment.tsx` | `SelectGarment` strip + `useSelectGarment(flow)` hook (used by home + onboarding select-garments) |
| `components/modals/contents/select-garment-type.tsx` | Type picker (top/bottom/dress/outerwear) after photo selection |
| `components/modals/select-photo-modal.tsx` | `SelectPhotoSheet` + `useSelectPhotoSheet` — generic camera/library + crop sheet used for *both* garments and models (shared photo-capture UX; see §3 placement note) |
| `constants/garments.ts` | `garmentTypeMap` labels |
| `icons/skirt.tsx`, `icons/dress.tsx`, `icons/jacket.tsx` + 3 SVGs in `assets/icons/` | Custom garment icons (only used by select-garment-type) |
| `constants/paths.ts` → `paths.fileSystem.garments.*` | fs storage layout |
| `context/garment-context.tsx` | DEAD — legacy pre-Legend-State selection (see §4) |

### 2.5 `generation` — AI try-on generation + home screen

| Current file | Role |
|---|---|
| `queries/image-generation/{api,keys,mutation,types}.ts` | POST /images/generate, base64 plumbing, retry-on-401, save result to fs |
| `components/v2/domain/generate-image-button.tsx` | CTA with trial/subscription gating + loading copy |
| `components/v2/image-loader.tsx` | Blurred-model loading placeholder |
| `components/v2/images-carousel.tsx` | Home carousel of generated images |
| `components/v2/generated-image-card.tsx` | Carousel slide card (delete + garment thumbnails) |
| `screens/home-screen.tsx` | Home tab = generate screen |
| `hooks/use-loading-state.tsx` | Rotating loading messages (generation-specific copy) |
| `state` slice: `generatedImages` collection + add/remove/delete actions + `useGeneratedImages` | Persisted results |
| `utils/file-uri-to-base64.ts`, `utils/save-to-file-system.ts` | fs helpers (shared utils, see §3) |

Duplication flag: `screens/onboarding/select-garments-screen.tsx` and `components/v2/domain/generate-image-button.tsx` independently build the *same* mutation payload (find garment by type, ids/types/count). Extract one `useGenerateTryOn()` hook in the generation slice during the refactor.

### 2.6 `gallery` — browsing generated images + garments, image detail viewer

| Current file | Role |
|---|---|
| `screens/gallery-screen.tsx` + `app/(tabs)/gallery.tsx` | Tabs generated/garments + filter |
| `components/gallery/gallery-tile.tsx` | Grid tile |
| `components/gallery/gallery-filter.tsx` | Type filter popover |
| `components/gallery/types.ts` | `GarmentFilter`, `ImageDetailType` |
| `components/gallery/image-detail-modal.tsx` | `ImageDetailContent` — zoom/pan viewer + delete/share (also used by `app/model-detail/[id].tsx`) |
| `app/image-detail/[id].tsx` | Route reading straight from `state.store.*` |

### 2.7 `subscription` — RevenueCat paywall + entitlements

| Current file | Role |
|---|---|
| `lib/subscription/{revenuecat,types,index}.ts` | RC configure, status, paywall/customer-center presentation (+6 dead exports, see §4) |
| `queries/subscription/{keys,use-subscription-status,index}.ts` | TanStack Query status query |
| `hooks/use-paywall.ts` | `showPaywall`/`requireSubscription`/`openCustomerCenter` + analytics |
| `components/subscription/subscription-provider.tsx` | Configures RC, prefetches status, invalidates on customer-info updates |

### 2.8 `settings` — settings tab

| Current file | Role |
|---|---|
| `screens/settings-screen.tsx` + `app/(tabs)/settings.tsx` | Current model, change-model sheet, manage subscription, (disabled) suggestions row |

### 2.9 `analytics` — PostHog (cross-cutting)

| Current file | Role |
|---|---|
| `lib/analytics/{client,config,provider,track,events,error-handlers,types,index}.ts` | PostHog client, `trackEvent`/`captureError`/`identifyUser`, event-name builders, global error handlers, provider (also bootstraps auth identity!) |

Note: `AnalyticsProvider.bootstrapIdentity()` currently *creates the auth identity* at startup — a hidden coupling: analytics depends on auth's API. Keep this call-out in the plan; in VSA the bootstrap belongs to the auth feature or the app shell, with analytics only consuming `identifyUser`.

### 2.10 App shell / cross-cutting (→ `src/shared/` + `app/`)

| Current file | Role |
|---|---|
| `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/+not-found.tsx`, `app/(tabs)/*.tsx` | Providers, protected stacks, thin route files |
| `components/v2/ui/*` (21 files) | Tamagui design-system primitives (`Button`, `Text`, `ScreenWrapper`, `Sheet`, `Tabs`, `Popover`, `Image`, `ListItem`, …) |
| `icons/index.ts` | Barrel re-exporting all of `@tamagui/lucide-icons` + 3 custom garment icons |
| `tamagui.config.ts`, `themes.ts` | Design tokens/themes (referenced by `babel.config.js` → path-sensitive) |
| `queries/provider.tsx` | `QueryClientProvider` (AsyncStorage-persisted) |
| `utils/generate-id.ts`, `open-camera.ts`, `open-image-library.ts`, `file-uri-to-base64.ts`, `save-to-file-system.ts` | Shared utilities |
| `constants/paths.ts` | fs storage layout |
| `state/` infra (observable + `syncObservable` + MMKV plugin) | Persistence plumbing |

---

## 3. VSA target structure

### 3.1 Layout

```
apps/mobile/
├── app/                          # expo-router routes — THIN composition only (must stay at this path)
│   ├── _layout.tsx               # providers + Stack.Protected guards
│   ├── (tabs)/{_layout,index,gallery,settings}.tsx
│   ├── onboarding/{_layout,welcome,select-user-photo,select-garments,finish}.tsx
│   ├── models-gallery.tsx
│   ├── model-detail/[id].tsx
│   ├── image-detail/[id].tsx
│   └── +not-found.tsx
├── src/
│   ├── shared/                   # cross-cutting only; features may import shared, never vice-versa
│   │   ├── ui/                   # ← components/v2/ui/* (pruned: drop input/toggle-group/x-group)
│   │   ├── icons/                # ← icons/index.ts (lucide re-export barrel)
│   │   ├── analytics/            # ← lib/analytics/*
│   │   ├── api/                  # ← queries/provider.tsx, queries/backend-headers.ts
│   │   ├── utils/                # ← generate-id, file-uri-to-base64, save-to-file-system, open-camera, open-image-library
│   │   ├── constants/            # ← constants/paths.ts (fs storage layout)
│   │   └── state/                # Legend-State plumbing: createPersistedSlice() helper, MMKV setup
│   ├── features/
│   │   ├── onboarding/
│   │   │   ├── screens/          # welcome, select-user-photo, select-garments, finish
│   │   │   ├── components/       # photo-guidelines-sheet
│   │   │   ├── hooks/            # use-image-size
│   │   │   ├── state.ts          # onboarding slice (isCompleted, currentStep) + useOnboarding
│   │   │   ├── assets/           # ← assets/images/generation-examples/
│   │   │   └── index.ts          # public API of the slice
│   │   ├── auth/
│   │   │   ├── api.ts            # ← queries/auth/api.ts
│   │   │   ├── state.ts          # auth slice (token, userId, installationId)
│   │   │   └── index.ts
│   │   ├── models/
│   │   │   ├── screens/          # models-gallery-screen
│   │   │   ├── components/       # change-model-sheet
│   │   │   ├── state.ts          # models slice + selectedModelId + useModels/useCurrentModel
│   │   │   └── index.ts
│   │   ├── garments/
│   │   │   ├── components/       # select-garment, select-garment-type, select-photo-sheet
│   │   │   ├── state.ts          # garments slices + ephemeral selection + hooks
│   │   │   ├── constants.ts      # garmentTypeMap
│   │   │   ├── icons/            # skirt/dress/jacket wrappers
│   │   │   ├── assets/           # the 3 garment SVGs
│   │   │   └── index.ts
│   │   ├── generation/
│   │   │   ├── screens/          # home-screen
│   │   │   ├── components/       # generate-image-button, image-loader, images-carousel, generated-image-card
│   │   │   ├── queries/          # api, keys, mutation, types  (+ new use-generate-try-on hook)
│   │   │   ├── hooks/            # use-loading-state
│   │   │   ├── state.ts          # generatedImages slice + useGeneratedImages
│   │   │   └── index.ts
│   │   ├── gallery/
│   │   │   ├── screens/          # gallery-screen
│   │   │   ├── components/       # gallery-tile, gallery-filter, image-detail-viewer (was image-detail-modal)
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── subscription/
│   │   │   ├── lib/              # revenuecat.ts, types.ts
│   │   │   ├── queries/          # keys, use-subscription-status
│   │   │   ├── hooks/            # use-paywall
│   │   │   ├── components/       # subscription-provider
│   │   │   └── index.ts
│   │   └── settings/
│   │       ├── screens/          # settings-screen
│   │       └── index.ts
│   └── app-shell/                # optional: provider composition currently inline in app/_layout.tsx
├── tamagui.config.ts, themes.ts  # KEEP at root (babel.config.js references './tamagui.config.ts')
├── assets/                       # only app-icon.png, app-icon-mini.png, favicon.png (referenced by app.json)
└── index.js, metro.config.js, babel.config.js, app.json, eas.json, tsconfig.json
```

Placement notes / judgment calls:

- **`app/` stays at `apps/mobile/app/`.** Moving the router root is possible (`EXPO_ROUTER_APP_ROOT`) but adds risk for zero user value. Route files import slices: `import { HomeScreen } from '@/features/generation';`.
- **`select-photo-modal.tsx` (`SelectPhotoSheet`)** is used by garments flow *and* model flow (onboarding select-user-photo passes `subject="model"`). It's a generic photo-capture sheet → put it in `shared/ui/` or a small `shared/media/` module, NOT in garments. (Its `SelectGarmentType` child stays in garments.)
- **`image-detail-modal.tsx` (`ImageDetailContent`)** serves both image-detail and model-detail routes → gallery feature, consumed by models feature via its public export.
- **Import direction rule:** `app/` → `features/*` → `shared/*`. Feature → feature imports allowed only via the target feature's `index.ts` barrel (e.g. onboarding imports `useGenerateTryOn` from `@/features/generation`). ESLint `no-restricted-imports` can enforce "no deep imports into another feature" later — optional, don't block the refactor on it.
- **Path aliases.** `tsconfig.json` already has `"@/*": ["./*"]` and Expo resolves tsconfig paths automatically (SDK 51+ default). Add explicit aliases for readability:
  ```json
  "@/shared/*": ["./src/shared/*"],
  "@/features/*": ["./src/features/*"]
  ```
  Keep `@/*` working during the whole migration so old imports don't break mid-flight.
- **Barrels per slice** (`index.ts`) with explicit named exports — avoid `export *` (the current `ui-legacy/index.tsx` + `v2/index.ts` `export *` chains are what allowed the layering inversion in the first place).

### 3.2 Before → after: concrete file moves

**Phase 1 (shared):**

| From | To |
|---|---|
| `components/v2/ui/*.tsx` (18 files; skip `input.tsx`, `toggle-group.tsx`, `x-group.tsx` — deleted in Phase 0) | `src/shared/ui/` |
| `icons/index.ts` | `src/shared/icons/index.ts` |
| `lib/analytics/*` | `src/shared/analytics/` |
| `queries/provider.tsx` | `src/shared/api/query-provider.tsx` (also delete dead devtools code) |
| `queries/backend-headers.ts` | `src/shared/api/backend-headers.ts` |
| `utils/generate-id.ts`, `file-uri-to-base64.ts`, `save-to-file-system.ts`, `open-camera.ts`, `open-image-library.ts` | `src/shared/utils/` |
| `constants/paths.ts` | `src/shared/constants/paths.ts` |

**Phase 2 (features):**

| From | To |
|---|---|
| `screens/settings-screen.tsx` | `src/features/settings/screens/settings-screen.tsx` |
| `screens/gallery-screen.tsx`, `components/gallery/{gallery-tile,gallery-filter,image-detail-modal,types}.ts(x)` | `src/features/gallery/{screens,components,types.ts}` |
| `screens/models-gallery-screen.tsx`, `components/modals/change-model-sheet.tsx` | `src/features/models/{screens,components}/` |
| `components/v2/domain/select-garment.tsx`, `components/modals/contents/select-garment-type.tsx`, `components/modals/select-photo-modal.tsx`(→ shared/media), `constants/garments.ts`, `icons/{skirt,dress,jacket}.tsx`, `assets/icons/{skirt-svgrepo-com,dress-cocktail-evening-3-svgrepo-com,jacket-svgrepo-com}.svg` | `src/features/garments/...` (sheet → `src/shared/media/select-photo-sheet.tsx`) |
| `screens/home-screen.tsx`, `components/v2/domain/generate-image-button.tsx`, `components/v2/{image-loader,images-carousel,generated-image-card}.tsx`, `queries/image-generation/*`, `hooks/use-loading-state.tsx` | `src/features/generation/...` |
| `screens/onboarding/*`, `components/modals/photo-guidelines-sheet.tsx`, `hooks/use-image-size.tsx`, `assets/images/generation-examples/` | `src/features/onboarding/...` |
| `lib/subscription/*`, `queries/subscription/*`, `hooks/use-paywall.ts`, `components/subscription/*` | `src/features/subscription/...` |
| `queries/auth/api.ts` | `src/features/auth/api.ts` |
| `state/*` (split) | `src/features/<domain>/state.ts` + `src/shared/state/` (see §5) |
| `components/modals/{index.ts,confirmation-modal.tsx}` | `confirmation-modal.tsx` → `src/shared/ui/confirmation-sheet.tsx` (it's a generic confirm dialog used by gallery + generation) |

`app/` route files stay; only their imports change. `screens/`, `components/`, `queries/`, `state/`, `lib/`, `context/`, `hooks/`, `utils/`, `constants/`, `icons/` disappear at the end.

### 3.3 Backend note (out of scope)

`apps/backend` is conventional AdonisJS v6 (`app/controllers`, `app/services`, `app/models`, `app/validators`, `app/middleware`, `config/`, `start/`, `database/migrations`) and has already grown subscription/usage/webhook modules (`subscription_controller.ts`, `revenuecat_webhooks_controller.ts`, `services/subscription_state_service.ts`, `subscription_reconciliation_service.ts`, `revenuecat_service.ts`). AdonisJS is already "feature-ish" via controllers+services and the user is happy with it — **no structural changes planned**. One forward-looking note: the mobile plan's `features/subscription` slice is where the future "Option C" (server-side RevenueCat verification, documented in `TODO.md`) client work will land; `fetchSubscriptionStatusFromBackend` in `lib/subscription/revenuecat.ts` is existing unused scaffolding for it (see §4 decision).

---

## 4. Dead code inventory (Phase 0 — FIRST refactor step)

All claims verified by repo-wide symbol search over `apps/mobile` on 2026-08-11. "Zero refs" = no match outside the defining file (and outside files that are themselves dead).

### 4.1 `components/ui-legacy/` — file by file

| File | Evidence | Action |
|---|---|---|
| `take-photo.tsx` | Zero refs. Not even exported by `ui-legacy/index.tsx`. Superseded by `SelectPhotoSheet`. | **DELETE** |
| `choose-photo.tsx` | Zero refs. Not exported by the barrel. | **DELETE** |
| `card-button.tsx` | Zero refs. Not exported by the barrel. Trivial wrapper over the dead legacy Button. | **DELETE** |
| `button.ts` | Imported only by `take-photo.tsx` and `choose-photo.tsx` (both dead). Legacy styled Button with unused variants (`buttonSize`, `primary`, `card`). | **DELETE** (after the 3 above) |
| `add-model-photo.tsx` | Imported only by `screens/home-screen.tsx` via the ui-legacy barrel. Uses raw `tamagui` `H5/H6` (violates the "use v2/ui" convention) and is functionally broken anyway — its action-button `XStack` is empty. | **INLINE** a proper empty state into the home screen (generation slice), then **DELETE** |
| `index.tsx` | Barrel: exports dead `./button`, `./add-model-photo`, and re-exports `../v2/generated-image-card` + `../v2/images-carousel` — a layering inversion; it's the *only* reason `home-screen.tsx` imports v2 code through a legacy path. Only consumer: `home-screen.tsx` (`AddModelPhoto`, `ImagesCarousel`). | **DELETE** after re-pointing `home-screen.tsx` to the real locations |

### 4.2 Other dead files

| File | Evidence | Action |
|---|---|---|
| `context/garment-context.tsx` | `GarmentsProvider` is mounted in `app/_layout.tsx`, but `GarmentsContext` has **zero consumers** (no `useContext` anywhere). Legacy top/bottom string selection fully superseded by `store$.ui.selectedGarmentIds`. | **DELETE** + remove provider from `_layout.tsx` |
| `utils/get-from-file-system.ts` | Zero imports. | **DELETE** |
| `utils/get-files-list.ts` | Zero imports. | **DELETE** |
| `utils/copy-file.ts` | Zero imports. | **DELETE** |
| `lib/onboarding/types.ts` | `OnboardingStatus` enum: zero refs. | **DELETE** |
| `lib/onboarding/constants.ts` | Re-exports `ONBOARDING_STEP_KEY`/`ONBOARDING_STATUS_KEY`; both have zero consumers (onboarding progress lives in Legend-State, not AsyncStorage). | **DELETE** |
| `lib/storage-keys.ts` | Only `PHOTO_GUIDELINES_SEEN_KEY` is used (by `photo-guidelines-sheet.tsx`). | **INLINE** the one key into the guidelines sheet (or move to onboarding slice), **DELETE** file |
| `constants/dimensions.ts` | `HEADER_HEIGHT`: zero refs. | **DELETE** |
| `components/dev-menu.tsx` | Only referenced by commented-out code in `app/_layout.tsx`. Sole consumer of `useResetState`. | **DELETE** (reset actions remain in state; or keep behind `__DEV__` — see §8 Q1) |
| `scripts/reset-project.js` | Stock Expo template script; its own header says "safely delete this file". | **DELETE** + remove `"reset-project"` from `package.json` scripts |
| `components/v2/ui/input.tsx` | `Input`: zero component usages. | **DELETE** |
| `components/v2/ui/toggle-group.tsx` | `ToggleGroup`: zero refs. | **DELETE** |
| `components/v2/ui/x-group.tsx` | `XGroup`: zero refs (settings uses `YGroup` from raw tamagui — separate fix). | **DELETE** |
| `ROUTES.md` | Stale: lists nonexistent routes (`second-page`, `third-page`) and unbuilt drawers; conflicts with reality. | **REWRITE** in Phase 3 (or delete; `AGENTS.md` route table is the living doc) |

### 4.3 Dead exports inside live files (prune, don't delete the file)

| Location | Dead symbol(s) | Evidence |
|---|---|---|
| `state/store.ts` | `outfits` collection (state + both resets), `computed.currentModelOutfits`, `computed.garmentsByType` | `outfits`/`OutfitImage` referenced only inside `state/`; `garmentsByType` zero refs |
| `state/store.ts` | actions: `updateModel`, `removeModel`, `updateGarment`, `deleteGarmentPermanently`, `updateGeneratedImage`, `setSelectedGarments`, `setAuthToken`, `setAuthUserId`, `setInstallationId`, `clearAuthToken` | Each appears only in `store.ts` (definition) and `hooks.ts` (re-exposure); zero component/query callers |
| `state/types.ts` | `OutfitImage` | Only used by the dead `outfits` collection |
| `state/hooks.ts` | `useAppState`, `useAuthState`, `useCurrentModelGeneratedImages` (only consumed by dead `useAppState`), `useResetState` (only consumed by dead `dev-menu.tsx`) | Zero live consumers |
| `state/index.ts` | `generateId` re-export | Zero external consumers |
| `hooks/index.ts` | `useEffectOnce` re-export | Zero refs |
| `lib/subscription/revenuecat.ts` + `index.ts` | `fetchSubscriptionPlans`, `purchaseSubscriptionPlan`, `restoreSubscriptionPurchases`, `fetchCustomerInfo`, `SUBSCRIPTION_ENTITLEMENT_ID` | Exported but zero importers |
| `lib/subscription/revenuecat.ts` + `index.ts` | `fetchSubscriptionStatusFromBackend` | Zero importers, BUT it is the scaffolding for "Option C" server-side verification (see `TODO.md`) — **KEEP, marked `@deprecated-until-OptionC` or delete and restore from git later; decide in §8 Q2** |
| `screens/models-gallery-screen.tsx` | `ArrowLeft` import (only `ChevronLeft` used) | Unused import |
| `queries/provider.tsx` | `onCopy` + commented `DevToolsBubble` | Dead dev code; `expo-clipboard` is imported only for this |

### 4.4 Dead / candidate npm dependencies (`apps/mobile/package.json`)

Confirmed zero imports in source: **`zustand`**, **`@google/genai`** (backend concern, wrongly in mobile), **`react-native-react-query-devtools`** (only a commented import), **`expo-clipboard`** (only used by the dead devtools code), **`expo-blur`**, **`expo-haptics`**, **`expo-symbols`**, **`sf-symbols-typescript`**, **`expo-image-manipulator`**, **`expo-image-loader`**.

Verify before removal (likely peers/transitives — check with `npm ls <pkg>` and a clean build): `expo-constants`, `expo-linking` (expo-router peers — likely KEEP), `expo-system-ui`, `react-native-webview` (Expo template defaults), `zeego` + `react-native-ios-context-menu` + `@react-native-menu/menu` (pulled in by `index.js`'s `@tamagui/native/setup-zeego`; removing zeego means editing `index.js` — decide with the user, rule #1 says ask before dependency changes anyway).

### 4.5 Convention violations to fix while moving (not dead, but wrong)

- `screens/home-screen.tsx`: imports `ImagesCarousel` from `@/components/ui-legacy` → import from generation slice.
- `screens/settings-screen.tsx`: `import { ScrollView, YGroup } from 'tamagui'` → use `shared/ui` (add `YGroup` wrapper if missing).
- `components/modals/photo-guidelines-sheet.tsx`: `import { ListItem, YGroup } from 'tamagui'` → use the existing `v2/ui/list-item` wrapper.
- `components/gallery/gallery-filter.tsx`, `components/gallery/image-detail-modal.tsx`, `screens/models-gallery-screen.tsx`: import lucide icons from `@tamagui/lucide-icons` directly → use `@/icons` (the barrel already re-exports all of lucide).
- `app/+not-found.tsx`: uses raw `tamagui` `Text/YStack` (and a placeholder Polish string "Elo elo z ooops") → use design-system components + real copy.

---

## 5. Legend-State store analysis & split plan

### 5.1 Current state (the "huge mess")

One file, `state/store.ts` (693 lines), exports a single `store$` observable of type `AppState` (`state/types.ts`):

| Slice | Persisted? | Shape | Live consumers |
|---|---|---|---|
| `models` | yes | `Record<id, ModelImage>` | home, settings, models-gallery, model-detail, onboarding select-user-photo, generation mutation |
| `garments.{top,bottom,dress,outerwear}` | yes | 4 × `Record<id, GarmentImage>` | select-garment, gallery, images-carousel, image-detail |
| `generatedImages` | yes | `Record<id, GeneratedImage>` | home, gallery, finish, image-detail |
| `outfits` | yes | `Record<id, OutfitImage>` | **none — dead** |
| `onboarding.{isCompleted,currentStep}` | yes | primitives | root layout guard, onboarding layout + 4 screens |
| `preferences.selectedModelId` | yes | `string \| null` | via `useModels`/`useCurrentModel` |
| `auth.{token,userId,installationId}` | yes | `string \| null` ×3 | auth api, backend-headers, analytics provider |
| `ui.selectedGarmentIds` | **no** (`exclude: ['ui']`) | `string[]` | select-garment, generate-image-button, onboarding select-garments |

Persistence: one `syncObservable(store$, { persist: { name: 'virtual-try-on', plugin: ObservablePersistMMKV, options: { exclude: ['ui'] } } })`.

Access patterns in the wild (all verified):
- Via hooks: `useModels`, `useCurrentModel`, `useGarments`, `useTop/Bottom/Dress/OuterwearGarments`, `useSelectedGarments`, `useGeneratedImages`, `useOnboarding` (`state/hooks.ts`).
- Direct store pokes bypassing hooks: `app/image-detail/[id].tsx` (`state.store.generatedImages[id].get()`, `state.store.garments.<type>[id].get()`, `state.actions.removeGeneratedImage`, `state.actions.removeGarment`), `app/model-detail/[id].tsx` (`state.store.models[id].get()`, `state.actions.setCurrentModel`), `queries/backend-headers.ts` + `queries/auth/api.ts` + `lib/analytics/provider.tsx` + `queries/image-generation/mutation.ts` (`state.actions.*`).
- Cross-slice coupling inside actions: `addModel` touches `preferences`; `setCurrentModel` iterates `models`; `removeGarment`/`deleteGarmentPermanently` touch `ui.selectedGarmentIds`; `removeModel`/`deleteModelPermanently` touch `preferences`; resets touch everything.
- Side-effectful actions: `addModel`/`addGarment` copy files into `documentDirectory`; `delete*Permanently` delete files. State module currently does fs I/O — in VSA move file operations to `shared/utils` (they already half-live there) and keep actions pure store mutations calling those utils.

### 5.2 Split strategy — two stages

**Stage A (this refactor): code-level split, persistence untouched.**

Hard constraint from `AGENTS.md` rule #3: *do not break the Legend-State store schema — it is persisted to MMKV and migration is manual*. So:

1. Each domain gets `src/features/<domain>/state.ts` exporting:
   - its slice's initial value + types,
   - its actions (functions taking the composed store, or slice-scoped action factories),
   - its hooks (`useModels`, `useGarments`, …).
2. `src/shared/state/store.ts` (or keep `state/` as a shrinking facade during migration) composes the slices into the *same* `AppState` shape, the *same* `store$`, the *same* MMKV key `virtual-try-on`, the *same* `exclude: ['ui']`:
   ```ts
   export const store$ = observable<AppState>({
     ...modelsSlice.initialState,      // models
     ...garmentsSlice.initialState,    // garments
     ...generationSlice.initialState,  // generatedImages
     ...onboardingSlice.initialState,  // onboarding
     ...authSlice.initialState,        // auth
     preferences: { selectedModelId: null },   // moves to models slice shape
     ui: { selectedGarmentIds: [] },           // stays ephemeral, garments slice
   });
   ```
   (Exact composition mechanics are an implementation detail; the invariant is: **the persisted JSON shape and MMKV key do not change** — existing testers keep their models/garments/images/onboarding flag.)
3. During the transition, `@/state` remains as a **facade** re-exporting from the new per-feature modules, so slices can be extracted one at a time without a flag day. Phase 3 removes the facade and rewires remaining importers (`@/state` imports die).
4. Kill the dead weight first (Phase 0 already deleted `outfits`, dead actions/hooks) so the split moves less code.

**Stage B (optional, later, NOT part of this refactor): persistence-level split.**

Per-domain MMKV keys (`fitly:models`, `fitly:garments`, …) with one `syncObservable` per slice. Benefits: smaller writes, per-slice versioning. Requires a one-time migration: on app start, if legacy MMKV key `virtual-try-on` exists, read its JSON, hydrate each slice store, then delete the legacy key. Write it as `src/shared/state/migrate-legacy-store.ts` with a `mmkv` direct read, unit-testable in isolation, and ship it behind a `src/shared/state/migrations.ts` version flag. Defer until there's a real need (e.g. store growth) — Stage A already delivers the maintainability win.

### 5.3 Target ownership map

| New module | Owns | Hooks exported |
|---|---|---|
| `features/models/state.ts` | `models`, `preferences.selectedModelId` | `useModels`, `useCurrentModel` |
| `features/garments/state.ts` | `garments.*`, `ui.selectedGarmentIds` | `useGarments`, per-type hooks, `useSelectedGarments` |
| `features/generation/state.ts` | `generatedImages` | `useGeneratedImages` |
| `features/onboarding/state.ts` | `onboarding.*` | `useOnboarding` |
| `features/auth/state.ts` | `auth.*` | (no hook needed — consumed via api modules; add `useAuthState` only if a UI needs it) |

Cross-slice actions stay explicit and small: e.g. garments' `removeGarment` also pruning the selection lives in garments (both pieces are garments-owned). `setCurrentModel` touching all models stays in models. The only genuine cross-domain logic is the factory-reset actions — put `resetDataWithoutOnboarding`/`resetAppData` in the shared state module since they orchestrate all slices.

---

## 6. Assets cleanup

### 6.1 `assets/images/`

| File | Status | Evidence |
|---|---|---|
| `app-icon.png` | KEEP — `app.json` `expo.icon` + splash plugin | app.json lines 7, 32 |
| `app-icon-mini.png` | KEEP — Android adaptive icon foreground | app.json line 15 |
| `favicon.png` | KEEP — web favicon | app.json line 25 |
| `adaptive-app-icon.png` | **DELETE** — not referenced anywhere (app.json adaptive icon uses `app-icon-mini.png`) | zero refs |
| `generation-examples/1..6.png` | KEEP, all 6 used by `welcome-screen.tsx`; `1.png` also used by `photo-guidelines-sheet.tsx` → MOVE to `src/features/onboarding/assets/generation-examples/` | requires `@/assets/...` imports to be updated to the new relative path |

Note: app.json references must stay valid — `app-icon*.png`/`favicon.png` keep their `./assets/images/` location (or update app.json in the same commit if moved). Generation examples move with the onboarding slice; `require()` paths get updated to relative `./assets/...` inside the slice.

### 6.2 `assets/icons/` + `icons/`

Used (via `icons/*.tsx` wrappers → `select-garment-type.tsx`): `skirt-svgrepo-com.svg`, `dress-cocktail-evening-3-svgrepo-com.svg`, `jacket-svgrepo-com.svg`.

**DELETE (13 files, zero refs):** `workwear.svg`, `tshirt.svg`, `tshirt-filled.svg`, `lab-coat.svg`, `jeans-garment-svgrepo-com.svg`, `briefs-shorts-swim-svgrepo-com.svg`, `woman-clothes.png`, `skirt.png`, `skirt (1).png`, `shorts.png`, `jeans.png`, `icons8-skirt-96.png`, `clothes.png`.

Consolidate: the 3 live SVGs + their `styled()` wrappers move into `src/features/garments/{assets,icons}/`. `icons/index.ts` (lucide re-export) moves to `src/shared/icons/` and stops re-exporting garment icons (garment slice imports its own icons locally). The Metro SVG transformer (`metro.config.js`) works for any path — no config change needed.

### 6.3 `assets/fonts/`

`SpaceMono-Regular.ttf` — **DELETE** (zero refs; root layout loads Inter + PlayfairDisplay only). Also remove `assets/fonts/` dir.

---

## 7. Migration plan (step-by-step, with verification gates)

Branching strategy: do the work on a long-lived branch `refactor/vsa` with one PR per phase (or per slice in Phase 2) so `main` stays shippable for closed testing. Every gate must pass before merge. No feature work mixed in.

**Verification gate (run at the end of every phase, from `apps/mobile/`):**
```bash
npx tsc --noEmit            # type-check (typedRoutes is on — route moves regenerate .expo/types)
npm run lint                # expo lint
npx expo export             # full bundle smoke test for all platforms (catches Metro resolution + asset issues)
```
Plus a manual smoke pass on a dev build for risky phases: fresh-install onboarding → generate → gallery → image detail → settings → change model → paywall presentation (RevenueCat sandbox).

**Working agreements for the whole refactor:**
- No behavior changes. File moves + import rewires + deletions only. Any bug found en route is fixed in a separate commit.
- Don't change the persisted store shape or MMKV key (AGENTS.md rule #3).
- Don't add dependencies (rule #1). Removing the confirmed-dead ones is a separate, explicit step (P0.4) the user approves first.
- After any file move, clear Metro cache on next dev run (`npx expo start -c`).

### Phase 0 — cleanup (deletes only; smallest possible diff to a leaner baseline)

- P0.1 Delete dead files: §4.1 (all of `ui-legacy/` — inline `AddModelPhoto` replacement into `home-screen.tsx` first and re-point the `ImagesCarousel` import), §4.2 (`context/garment-context.tsx` + remove `<GarmentsProvider>` from `app/_layout.tsx`, 3 dead utils, `lib/onboarding/`, `lib/storage-keys.ts` after inlining `PHOTO_GUIDELINES_SEEN_KEY`, `constants/dimensions.ts`, `dev-menu.tsx`, `scripts/reset-project.js` + package.json script, 3 unused v2/ui primitives + prune `v2/ui/index.ts`).
- P0.2 Prune dead exports: §4.3 (state store/types/hooks/index, `hooks/index.ts`, `lib/subscription/` — except the Option C decision, unused `ArrowLeft` import, dead devtools code in `queries/provider.tsx`).
- P0.3 Delete dead assets: §6 (13 icons, `adaptive-app-icon.png`, `SpaceMono-Regular.ttf`).
- P0.4 (needs explicit user approval per rule #1) Remove confirmed dead deps: `zustand`, `@google/genai`, `react-native-react-query-devtools`, `expo-clipboard`, `expo-blur`, `expo-haptics`, `expo-symbols`, `sf-symbols-typescript`, `expo-image-manipulator`, `expo-image-loader`. Then `npm install` at repo root + verify a clean dev-client build. Skip/keep any that `npm ls` shows as required peers.
- **GATE 0:** tsc + lint + `expo export` green; manual smoke (app boots, onboarding guard works, generate flow works). Commit: `refactor: remove dead code and unused assets`.

### Phase 1 — shared foundation (moves, no deletes)

- P1.1 Create `src/shared/`; add `@/shared/*` + `@/features/*` tsconfig paths (keep `@/*`).
- P1.2 Move `components/v2/ui/` → `src/shared/ui/` (single barrel, explicit exports). Bulk-update imports (they're mechanical: `@/components/v2/ui` → `@/shared/ui`; also fix the raw-tamagui imports listed in §4.5 to use it).
- P1.3 Move `icons/index.ts` → `src/shared/icons/`; re-point `@/icons` importers (or add `"@/icons": ["./src/shared/icons"]` path alias to make it a no-op — preferred).
- P1.4 Move `lib/analytics/` → `src/shared/analytics/`; `queries/provider.tsx` → `src/shared/api/query-provider.tsx`; `queries/backend-headers.ts` → `src/shared/api/`; live utils → `src/shared/utils/`; `constants/paths.ts` → `src/shared/constants/`.
- P1.5 Move `components/modals/confirmation-modal.tsx` → `src/shared/ui/confirmation-sheet.tsx`.
- P1.6 Move `components/modals/select-photo-modal.tsx` → `src/shared/media/select-photo-sheet.tsx` (used by both models and garments flows).
- Leave temporary re-export shims where it avoids touching feature code that moves in Phase 2 anyway (delete shims in Phase 3). Prefer direct import updates over shims when the consumer file is being touched anyway.
- **GATE 1:** tsc + lint + export green; manual smoke. Commit: `refactor: extract shared layer (ui, icons, analytics, api, utils)`.

### Phase 2 — slice-by-slice extraction (one domain per commit/PR, smallest risk first)

Order rationale: start with slices that have no routes of their own logic and few inbound dependencies; end with the most-wired ones.

1. **settings** — 1 screen + reuses shared change-model sheet location TBD. Move `screens/settings-screen.tsx` → `features/settings/screens/`. Update `app/(tabs)/settings.tsx` import. Smallest possible slice; validates the playbook.
2. **gallery** — move `screens/gallery-screen.tsx` + `components/gallery/*` → `features/gallery/`; re-point `app/(tabs)/gallery.tsx`, `app/image-detail/[id].tsx`, `app/model-detail/[id].tsx` imports of `ImageDetailContent`/types.
3. **models** — move models-gallery screen + `change-model-sheet` + `features/models/state.ts` (models slice + selectedModelId; actions addModel/setCurrentModel/deleteModelPermanently; hooks useModels/useCurrentModel). Rewire consumers (settings, onboarding screens still at old paths — they import via the `@/state` facade, which now delegates to the models module).
4. **garments** — move select-garment, select-garment-type, `constants/garments.ts`, garment icons + 3 SVGs, garments state module (collections + ephemeral selection + hooks). Consumers: home, onboarding select-garments, gallery, carousel, image-detail.
5. **generation** — move home-screen, generate-image-button, image-loader, images-carousel, generated-image-card, `queries/image-generation/*`, `use-loading-state`, generatedImages state module. Extract `useGenerateTryOn()` to kill the payload duplication between home and onboarding select-garments.
6. **onboarding** — move 4 screens + photo-guidelines-sheet + use-image-size + generation-examples assets + onboarding state module. Route files update imports only. Verify the `Stack.Protected` guard + resume-step redirect still work (they read `useOnboarding` — facade must stay reactive-identical).
7. **subscription** — move lib/subscription, queries/subscription, use-paywall, subscription-provider → `features/subscription/`. Consumers: generate-image-button, finish-screen, settings-screen, root layout.
8. **auth** — move `queries/auth/api.ts` → `features/auth/api.ts` + auth state module. Consumers: analytics provider, backend-headers, generation api. Also fix the hidden coupling: root-layout bootstrap (currently inside `AnalyticsProvider`) should call auth's `getOrCreateAuthIdentity()` itself, then `identifyUser()` — analytics stops importing auth.
- **GATE 2 (per slice):** tsc + lint + export green after *each* slice; manual smoke after slices 3, 5, 6 (state-touching ones). Commits: `refactor: extract <domain> feature slice`.

### Phase 3 — route/import cleanup + state facade removal + docs

- P3.1 Delete the now-empty old dirs (`components/`, `screens/`, `queries/`, `state/`, `lib/`, `context/`, `hooks/`, `utils/`, `constants/`, `icons/`) and any remaining shims; global search for `@/components`, `@/screens`, `@/state`, `@/queries`, `@/lib`, `@/hooks`, `@/utils`, `@/constants`, `@/icons` must return zero hits.
- P3.2 Finalize per-feature barrels (`index.ts` with explicit exports). Remove `@/*` catch-all alias if desired (or keep — harmless).
- P3.3 Rewrite `ROUTES.md` (or delete and point to AGENTS.md table); update `AGENTS.md` project-structure section + conventions (new import rules, slice layout).
- P3.4 Final **GATE 3:** tsc + lint + `expo export` green from a clean clone (`rm -rf node_modules && npm install` at root) + full manual smoke list + verify persisted data survives an upgrade install over the previous build (install old build → add model/garment/generate → upgrade → data still there; this validates the MMKV-shape invariant).
- Commit: `refactor: finalize vertical slice architecture`.

Estimated per-phase risk: P0 low (pure deletion of provably-unreferenced code), P1 low-medium (mechanical import rewires; Metro cache is the usual gotcha), P2 medium (state module splits — mitigated by the facade + unchanged persisted shape), P3 low.

---

## 8. Risks & open questions

### Risks

1. **MMKV schema drift (highest).** Any change to the persisted `AppState` shape or the `virtual-try-on` key silently wipes or corrupts tester data. Mitigation: Stage-A split keeps shape identical by construction; Gate 3 includes an upgrade-install data-persistence check.
2. **Typed routes.** `experiments.typedRoutes` is on; route imports of params (`/image-detail/[id]?type=...`) are type-checked. Route files themselves don't move, but `.expo/types` must regenerate (happens on `expo start`/`expo export`); stale types can cause phantom tsc errors — clear with `npx expo start -c` once.
3. **Babel/Tamagui config path.** `babel.config.js` references `./tamagui.config.ts` — keep `tamagui.config.ts` + `themes.ts` at the mobile root (as planned) or update babel in the same commit.
4. **Metro workspace resolution.** Moving files doesn't affect `metro.config.js` (nodeModulesPaths/svg transformer are path-independent), but stale Metro caches after big moves cause confusing red screens — always `expo start -c` after a phase.
5. **Barrel `export *` cycles.** The current `ui-legacy → v2` re-export chain shows how barrels hide layering problems. New barrels use explicit named exports; features never re-export another feature.
6. **Hidden startup coupling.** `AnalyticsProvider` currently bootstraps auth identity (and thus RevenueCat app-user sync). Moving auth without moving this call would break startup auth for fresh installs. Covered in Phase 2 slice 8.
7. **Closed-testing shippability.** Refactor PRs must each leave the app fully working; no "big-bang" branch that diverges for weeks. The per-slice commits keep `main` releasable at every gate.

### Open questions for the user

1. **DevMenu:** delete entirely (it is currently commented out and is the only consumer of `useResetState`), or keep a `__DEV__`-gated version in `src/shared/dev/`? Recommendation: delete; reset actions remain callable from a debug menu re-added later if needed.
2. **Option C scaffolding:** keep `fetchSubscriptionStatusFromBackend` + `BackendSubscriptionStatus` (unused today, needed for server-side RevenueCat verification in `TODO.md`), or delete and restore from git when Option C starts? Recommendation: keep, with a one-line `// TODO(Option C): wire up when backend verification ships` comment.
3. **`outfits` entity:** this plan deletes it (zero consumers). If outfits are an imminent v1.1 feature, keep the type but drop the store collection? Recommendation: delete — git history preserves it; re-add properly when the feature starts (scope discipline).
4. **Dependency removals (P0.4)** need your sign-off per rule #1 (esp. `zeego`/context-menu chain and the `expo-*` template defaults).
5. **`fetchCustomerInfo` / `purchaseSubscriptionPlan` / `restoreSubscriptionPurchases` / `fetchSubscriptionPlans`:** currently unused because the RevenueCat paywall UI handles purchases. Delete, or keep for a future custom paywall? Recommendation: delete (restore from git if a custom paywall is built).
6. **Settings "Add app suggestion" row** is a disabled placeholder ("Coming soon") — keep as-is (out of refactor scope), just flagging.

---

## Appendix A — Evidence index (how dead-code claims were verified)

Repo-wide symbol searches over `apps/mobile` (2026-08-11), examples of the zero-hit or self-only-hit patterns used: `ui-legacy` (2 hits: its own barrel consumer + self), `TakePhoto|ChoosePhoto|CardButton` (0), `GarmentsContext` (0 consumers), `getFromFileSystem`/`getFilesList`/`copyFile` (self only), `OnboardingStatus`/`ONBOARDING_STEP_KEY`/`ONBOARDING_STATUS_KEY` (definition + dead re-export only), `useAppState`/`useAuthState`/`useCurrentModelGeneratedImages`/`useResetState` (state-internal or dev-menu only), `outfits`/`OutfitImage`/`currentModelOutfits`/`garmentsByType` (state-internal only), `updateModel`/`removeModel`/`updateGarment`/`deleteGarmentPermanently`/`updateGeneratedImage`/`setSelectedGarments`/`setAuthToken`/`setAuthUserId`/`setInstallationId`/`clearAuthToken` (definition + hook re-export only), `fetchSubscriptionPlans`/`purchaseSubscriptionPlan`/`restoreSubscriptionPurchases`/`fetchCustomerInfo`/`SUBSCRIPTION_ENTITLEMENT_ID`/`fetchSubscriptionStatusFromBackend` (definition + barrel only), `HEADER_HEIGHT`/`SpaceMono`/`adaptive-app-icon`/`zeego`/`zustand`/`@google/genai` (definition or package.json only). Live-symbol spot checks: `openCamera`/`openImageLibrary` (select-photo-modal, settings-screen), `useMount` (4 onboarding screens + guidelines sheet), `usePaywall` (generate-image-button, settings, finish), `useImageSize` (4 onboarding screens), `useLoadingState` (generate-image-button, image-loader), `toggleSelection`/`clearSelection` (select-garment, generate-image-button, onboarding select-garments), `deleteModelPermanently` (mutation, select-user-photo), `deleteGeneratedImagePermanently` (home), `removeGarment`/`removeGeneratedImage` (image-detail route), `getOrCreateInstallationId` (backend-headers, auth api, analytics provider), `completeOnboarding`/`setOnboardingStep` (onboarding screens).

## Appendix B — File counts

- Source files analyzed in `apps/mobile`: ~129 (14 routes + 48 components + 7 screens + 4 state + 10 queries + 14 lib + 1 context + 4 hooks + 8 utils + 3 constants + 4 icons + 12 root configs/scripts).
- Asset files: 23 (4 app images + 6 generation examples + 12 icons dir + 1 font).
- Recommended deletions: 19 source files + 15 asset files + ~20 dead exports/actions/hooks + 6–15 npm deps (6 confirmed).
