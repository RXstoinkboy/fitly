/**
 * Supabase Integration Example (Template - Not Executed)
 *
 * This file demonstrates how to integrate Supabase sync with Legend-State
 * for remote synchronization once you're ready to implement it.
 *
 * DO NOT IMPORT OR USE THIS FILE YET - IT'S A TEMPLATE FOR FUTURE USE
 */

/*
import { observable } from '@legendapp/state';
import { syncedSupabase } from '@legendapp/state/sync-plugins/supabase';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { supabase } from '@/lib/supabase';
import type { AppState } from './types';

// ============================================================================
// Supabase Configuration
// ============================================================================

// You'll need to set up these tables in Supabase with the following columns:
//
// Table: models
// - id: uuid (primary key)
// - user_id: uuid (foreign key to auth.users)
// - name: text (nullable)
// - mime_type: text (nullable)
// - source: text (nullable)
// - file_path: text
// - is_current: boolean
// - created_at: timestamptz (with trigger)
// - updated_at: timestamptz (with trigger)
// - deleted: boolean (for soft deletes)
//
// Table: garments
// - id: uuid (primary key)
// - user_id: uuid (foreign key to auth.users)
// - name: text (nullable)
// - mime_type: text (nullable)
// - source: text (nullable)
// - file_path: text
// - type: text ('top' | 'bottom')
// - created_at: timestamptz (with trigger)
// - updated_at: timestamptz (with trigger)
// - deleted: boolean (for soft deletes)
//
// Table: generated_images
// - id: uuid (primary key)
// - user_id: uuid (foreign key to auth.users)
// - name: text (nullable)
// - mime_type: text (nullable)
// - file_path: text
// - model_id: uuid (foreign key to models)
// - garment_ids: jsonb (array of uuids)
// - metadata: jsonb (nullable)
// - created_at: timestamptz (with trigger)
// - updated_at: timestamptz (with trigger)
// - deleted: boolean (for soft deletes)

// ============================================================================
// SQL Setup Scripts
// ============================================================================

// Run these in your Supabase SQL editor:

// 1. Create handle_times function (for auto-updating created_at/updated_at)
//
// CREATE OR REPLACE FUNCTION handle_times()
//     RETURNS trigger AS
//     $$
//     BEGIN
//     IF (TG_OP = 'INSERT') THEN
//         NEW.created_at := now();
//         NEW.updated_at := now();
//     ELSEIF (TG_OP = 'UPDATE') THEN
//         NEW.created_at = OLD.created_at;
//         NEW.updated_at = now();
//     END IF;
//     RETURN NEW;
//     END;
//     $$ language plpgsql;

// 2. Create triggers for each table:
//
// CREATE TRIGGER handle_times_models
//     BEFORE INSERT OR UPDATE ON models
//     FOR EACH ROW
// EXECUTE PROCEDURE handle_times();
//
// CREATE TRIGGER handle_times_garments
//     BEFORE INSERT OR UPDATE ON garments
//     FOR EACH ROW
// EXECUTE PROCEDURE handle_times();
//
// CREATE TRIGGER handle_times_generated_images
//     BEFORE INSERT OR UPDATE ON generated_images
//     FOR EACH ROW
// EXECUTE PROCEDURE handle_times();

// 3. Enable Row Level Security (RLS):
//
// ALTER TABLE models ENABLE ROW LEVEL SECURITY;
// ALTER TABLE garments ENABLE ROW LEVEL SECURITY;
// ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
//
// CREATE POLICY "Users can view their own models"
//   ON models FOR SELECT
//   USING (auth.uid() = user_id);
//
// CREATE POLICY "Users can insert their own models"
//   ON models FOR INSERT
//   WITH CHECK (auth.uid() = user_id);
//
// CREATE POLICY "Users can update their own models"
//   ON models FOR UPDATE
//   USING (auth.uid() = user_id);
//
// -- Repeat similar policies for garments and generated_images

// ============================================================================
// Supabase-Synced Store
// ============================================================================

// Get the current user ID
const getUserId = () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};

export const storeWithSupabase$ = observable<AppState>({
  // Models with Supabase sync
  models: syncedSupabase({
    supabase,
    collection: 'models',
    // Filter by current user
    filter: (select) => select.eq('user_id', await getUserId()),
    // Actions to sync
    actions: ['read', 'create', 'update'],
    // Use soft deletes
    fieldDeleted: 'deleted',
    // Enable realtime updates
    realtime: { filter: `user_id=eq.${await getUserId()}` },
    // Local persistence with retry
    persist: { 
      name: 'virtual-try-on-models',
      plugin: ObservablePersistMMKV,
      retrySync: true,
    },
    // Sync only changes since last sync
    changesSince: 'last-sync',
    fieldCreatedAt: 'created_at',
    fieldUpdatedAt: 'updated_at',
    // Debounce changes to reduce API calls
    debounceSet: 500,
  }),

  // Garments with Supabase sync
  garments: {
    top: syncedSupabase({
      supabase,
      collection: 'garments',
      filter: (select) => select.eq('user_id', await getUserId()).eq('type', 'top'),
      actions: ['read', 'create', 'update'],
      fieldDeleted: 'deleted',
      realtime: { filter: `user_id=eq.${await getUserId()},type=eq.top` },
      persist: { 
        name: 'virtual-try-on-garments-top',
        plugin: ObservablePersistMMKV,
        retrySync: true,
      },
      changesSince: 'last-sync',
      fieldCreatedAt: 'created_at',
      fieldUpdatedAt: 'updated_at',
      debounceSet: 500,
    }),

    bottom: syncedSupabase({
      supabase,
      collection: 'garments',
      filter: (select) => select.eq('user_id', await getUserId()).eq('type', 'bottom'),
      actions: ['read', 'create', 'update'],
      fieldDeleted: 'deleted',
      realtime: { filter: `user_id=eq.${await getUserId()},type=eq.bottom` },
      persist: { 
        name: 'virtual-try-on-garments-bottom',
        plugin: ObservablePersistMMKV,
        retrySync: true,
      },
      changesSince: 'last-sync',
      fieldCreatedAt: 'created_at',
      fieldUpdatedAt: 'updated_at',
      debounceSet: 500,
    }),
  },

  // Generated images with Supabase sync
  generatedImages: syncedSupabase({
    supabase,
    collection: 'generated_images',
    filter: (select) => select.eq('user_id', await getUserId()),
    actions: ['read', 'create', 'update'],
    fieldDeleted: 'deleted',
    realtime: { filter: `user_id=eq.${await getUserId()}` },
    persist: { 
      name: 'virtual-try-on-generated',
      plugin: ObservablePersistMMKV,
      retrySync: true,
    },
    changesSince: 'last-sync',
    fieldCreatedAt: 'created_at',
    fieldUpdatedAt: 'updated_at',
    debounceSet: 500,
  }),

  // Outfits (add similar sync if needed)
  outfits: {},

  // App metadata (local only - not synced)
  onboarding: {
    isCompleted: false,
    currentStep: 0,
  },

  preferences: {
    selectedModelId: null,
  },

  ui: {
    selectedGarmentIds: [],
  },
});

// ============================================================================
// Usage Notes
// ============================================================================

// 1. File Upload to Supabase Storage:
//
// Before creating a record in the database, upload the image file:
//
// const uploadImageToSupabase = async (filePath: string, bucket: string) => {
//   const filename = `${Date.now()}-${filePath.split('/').pop()}`;
//   const { data, error } = await supabase.storage
//     .from(bucket)
//     .upload(filename, {
//       uri: filePath,
//       type: 'image/jpeg',
//       name: filename,
//     });
//
//   if (error) throw error;
//
//   const { data: { publicUrl } } = supabase.storage
//     .from(bucket)
//     .getPublicUrl(filename);
//
//   return publicUrl;
// };

// 2. Modified addModel action with Supabase:
//
// addModel: async (filePath: string, source: ImageSource): Promise<string> => {
//   const id = generateId();
//   
//   // Upload to Supabase Storage
//   const publicUrl = await uploadImageToSupabase(filePath, 'models');
//   
//   const model: ModelImage = {
//     id,
//     name: null,
//     mimeType: 'image/jpeg',
//     source,
//     filePath: publicUrl, // Use the Supabase URL
//     isCurrent: Object.keys(store$.models.get()).length === 0,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     deletedAt: null,
//   };
//   
//   store$.models[id].set(model);
//   
//   return id;
// };

// 3. Authentication Check:
//
// const isAuthed$ = observable(false);
//
// supabase.auth.onAuthStateChange((event, session) => {
//   isAuthed$.set(!!session);
// });
//
// // Then add to sync config:
// syncedSupabase({
//   ...config,
//   waitFor: isAuthed$,
// });

// 4. Handle Conflicts:
//
// If you need custom conflict resolution, use the transform option:
//
// syncedSupabase({
//   ...config,
//   transform: {
//     load: (value) => {
//       // Transform data coming from Supabase
//       return value;
//     },
//     save: (value) => {
//       // Transform data going to Supabase
//       return value;
//     },
//   },
// });

*/

export {};
