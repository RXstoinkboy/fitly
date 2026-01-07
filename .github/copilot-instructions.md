# Fitly - AI Coding Agent Instructions

## Project Overview
Fitly is a React Native mobile app built with Expo Router for virtual garment try-on using AI image generation. Users upload photos of themselves and clothing items, then generate images showing how the clothes would look on them.

## Tech Stack
- **Framework**: Expo ~53 + React Native 0.79 + React 19
- **Navigation**: Expo Router v5 (file-based routing)
- **Styling**: Tamagui v1.137 (design system with variants)
- **State Management**: 
  - TanStack Query v5 (data fetching with AsyncStorage persistence)
  - Zustand (ephemeral UI state like modals)
  - React Context (GarmentsContext for selected garments)
- **Storage**: Expo FileSystem (local images) + AsyncStorage (metadata)
- **Backend**: Supabase (Edge Functions for AI image generation)
- **Image Handling**: expo-image-picker, expo-file-system

## Architecture Patterns

### File-Based Routing with Protected Routes
- Routes use `Stack.Protected` with `guard` prop for conditional access based on onboarding status
- Main layout (`app/_layout.tsx`) checks `useGetStatus()` to determine if user completed onboarding
- Two protected route groups: `onboarding/*` (guard: `!isOnboarded`) and `(tabs)/*` (guard: `isOnboarded`)

### Data Fetching Layer (`queries/` directory)
All data access uses TanStack Query hooks with this structure:
```typescript
// queries/[domain]/get-[entity]-list.tsx
export const useGetModelsList = () => {
  return useQuery({
    queryKey: modelsKeys.list(),
    queryFn: async () => {
      const models = await getFilesList(paths.fileSystem.models);
      return models;
    },
  });
};
```

**Key patterns:**
- Query keys centralized in `keys.ts` files using factory pattern
- Mutations invalidate related queries in `onSuccess`/`onSettled` callbacks
- File URIs stored as strings (paths to FileSystem.documentDirectory)
- Base64 encoding handled by `fileUriToBase64` utility before API calls

### Component Architecture

#### UI Components (`components/v2/ui/`)
Modern component library using Tamagui's `styled()` API with variants:
```typescript
export const Button = styled(TamaguiButton, {
  variants: {
    type: {
      ghost: { backgroundColor: 'transparent', ... },
      primary: { backgroundColor: '$accent1', ... }
    },
    stretched: { true: { width: '100%' } }
  }
});
```

**Import from**: `@/components/v2/ui` (barrel export in `index.ts`)

#### Legacy Components (`components/ui-legacy/`)
Older implementation - prefer v2 components for new features

### Tamagui Theming
- Theme config in `tamagui.config.ts` (uses defaultConfig from @tamagui/config/v4)
- Custom themes in `themes.ts` with base + accent palettes
- Token usage: `$color1-12` (palette steps), `$accent1-12` (accent colors), `$[size]` (spacing/sizing)
- Variant syntax: `<Button type="primary" stretched />` not `variant="primary"`

### File System Storage Pattern
Images stored in document directory with structured paths (see `constants/paths.ts`):
```typescript
paths.fileSystem = {
  generated: 'generated',
  garments: { top: 'garments/top', bottom: 'garments/bottom' },
  models: 'models'
}
```

Access pattern: `${FileSystem.documentDirectory}${paths.fileSystem.models}`

### State Management Conventions

1. **TanStack Query**: Server state, cached data, async operations
2. **Zustand**: Modal visibility, transient UI state (see `stores/select-photo-modal.ts`)
3. **React Context**: Cross-component shared state (garment selection in `GarmentsContext`)
4. **AsyncStorage**: Persisted metadata (onboarding status via `ONBOARDING_STATUS_KEY`)

## Common Tasks

### Adding a New Data Query
1. Create hook in `queries/[domain]/get-[name].tsx`
2. Add query key to `queries/[domain]/keys.ts`
3. Use `useQuery` with `queryKey` and async `queryFn`
4. For file-based data: use `getFilesList(path)` utility

### Adding a New Mutation
1. Create hook in `queries/[domain]/add-[name].tsx` or `update-[name].tsx`
2. Use `useMutation` with `mutationKey` and async `mutationFn`
3. Invalidate related queries in `onSuccess`:
```typescript
onSuccess: () => {
  return queryClient.invalidateQueries({ queryKey: modelsKeys.list() });
}
```

### Creating a New Screen
1. Add file to `app/` following Expo Router conventions
2. Wrap in `<ScreenWrapper>` from `@/components/v2/ui`
3. Use `<YStack>` for vertical layouts, `<XStack>` for horizontal
4. Import UI components from `@/components/v2/ui`

### Working with Images
- Use `expo-image-picker` (via `openCamera()` or `openImageLibrary()` utils)
- Store as FileSystem URIs (e.g., `file:///data/user/0/.../models/image.jpg`)
- Convert to base64 for API calls: `await fileUriToBase64(imageUri)`
- Save from base64: `saveToFileSystem(path, base64String)`

### Modal Pattern (Zustand + Sheet)
```typescript
// 1. Create store in stores/
export const usePhotoModalStore = create<PhotoModalState>()((set) => ({
  visible: false,
  toggle: (visible?: boolean) => set((state) => ({ visible: visible ?? !state.visible }))
}));

// 2. Create hook wrapper
export const useSelectPhotoModal = () => {
  const [opened, setOpened] = useState(false);
  return { isOpen: opened, toggle: (opened?: boolean) => setOpened((prev) => opened ?? !prev) };
};

// 3. Use Tamagui Sheet component
<Sheet modal open={isOpen} onOpenChange={toggle}>
  <Sheet.Overlay />
  <Sheet.Handle />
  <Sheet.Frame>{/* content */}</Sheet.Frame>
</Sheet>
```

## Development Commands
- `npm start` - Start Expo dev server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run lint` - Run ESLint

## Critical Notes
- **Path Aliases**: Use `@/` prefix for absolute imports (configured in tsconfig.json)
- **Type Safety**: TypeScript strict mode enabled with `experimentalDecorators`
- **Image Aspect Ratio**: User photos locked to 3:4 ratio (see ImagePicker config)
- **Query Persistence**: All queries cached to AsyncStorage with 24hr GC time
- **React Query DevTools**: Enabled in dev (bubble UI with clipboard integration)
- **New Architecture**: Expo's new architecture enabled (`newArchEnabled: true`)

## Anti-Patterns to Avoid
- Don't use WatermelonDB (legacy references exist but not actively used)
- Don't import from `components/ui-legacy` for new features
- Don't store images in state - use FileSystem URIs and TanStack Query
- Don't use `variant=` prop syntax with Tamagui - use variant names directly as props
- Don't bypass query invalidation - always invalidate after mutations

## External Integrations
- **Supabase Edge Function**: `generate-image` endpoint accepts base64 images, returns generated image
- **Google GenAI**: Used in backend for image generation (credentials in env vars)