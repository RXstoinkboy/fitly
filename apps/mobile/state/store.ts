/**
 * Legend-State Store
 * Main observable store with MMKV persistence for local-first architecture
 */

import { observable } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import type {
  AppState,
  ModelImage,
  GarmentImage,
  GeneratedImage,
  GarmentType,
  ImageSource,
} from './types';
import { generateId } from '../utils/generate-id';
import * as FileSystem from 'expo-file-system/legacy';
import { paths } from '@/constants/paths';

// ============================================================================
// Store Definition
// ============================================================================

/**
 * Main application store
 * All data is persisted to MMKV except ephemeral UI state
 */
export const store$ = observable<AppState>({
  models: {},
  garments: {
    top: {},
    bottom: {},
  },
  generatedImages: {},
  outfits: {},
  onboarding: {
    isCompleted: false,
    currentStep: '/onboarding/welcome',
  },
  preferences: {
    selectedModelId: null,
  },
  auth: {
    token: null,
    userId: null,
    installationId: null,
  },
  ui: {
    selectedGarmentIds: [],
  },
});

// ============================================================================
// Persistence Configuration
// ============================================================================

/**
 * Configure MMKV persistence for the store
 * Persists everything except ephemeral UI state
 */
syncObservable(store$, {
  persist: {
    name: 'virtual-try-on',
    plugin: ObservablePersistMMKV,
    options: {
      exclude: ['ui'], // Exclude ephemeral UI state from persistence
    },
  },
});

// ============================================================================
// Computed Observables
// ============================================================================

/**
 * Computed values derived from the store
 * These are reactive and update automatically when their dependencies change
 */
const computed = {
  /**
   * Get the currently selected model
   */
  currentModel: () => {
    const id = store$.preferences.selectedModelId.get();
    return id ? store$.models[id].get() : null;
  },

  /**
   * Get all models as an array (excluding soft-deleted)
   */

  modelsArray: () => {
    // Get raw data first to avoid creating Proxies during iteration
    const models = store$.models.get();
    return Object.values(models).filter((model) => !model.deletedAt);
  },

  /**
   * Get garments of a specific type as an array (excluding soft-deleted)
   */
  garmentsByType: (type: GarmentType) => {
    // Get raw data first to avoid creating Proxies during iteration
    const garments = store$.garments[type].get();
    return Object.values(garments).filter((garment) => !garment.deletedAt);
  },

  /**
   * Get garments of a specific type as an array (excluding soft-deleted)
   */
  garments: () => {
    // Get raw data first to avoid creating Proxies during iteration
    const garments = store$.garments.get();
    return Object.values(garments).filter((garment) => !garment.deletedAt);
  },

  /**
   * Get all top garments
   */
  topGarments: () => {
    // Get raw data first to avoid creating Proxies during iteration
    const garments = store$.garments.top.get();
    return Object.values(garments).filter((garment) => !garment.deletedAt);
  },

  /**
   * Get all bottom garments
   */
  bottomGarments: () => {
    // Get raw data first to avoid creating Proxies during iteration
    const garments = store$.garments.bottom.get();
    return Object.values(garments).filter((garment) => !garment.deletedAt);
  },

  /**
   * Get currently selected garments
   */
  selectedGarments: () => {
    // Get raw data first to avoid creating Proxies during iteration
    const ids = store$.ui.selectedGarmentIds.get();
    const allGarments = {
      ...store$.garments.top.get(),
      ...store$.garments.bottom.get(),
    };
    return ids.map((id) => allGarments[id]).filter(Boolean);
  },

  /**
   * Get generated images for the current model
   */
  currentModelGeneratedImages: () => {
    const modelId = store$.preferences.selectedModelId.get();
    if (!modelId) return [];

    // Get raw data first to avoid creating Proxies during iteration
    const images = store$.generatedImages.get();
    return Object.values(images).filter((img) => img.modelId === modelId && !img.deletedAt);
  },

  /**
   * Get all generated images (excluding soft-deleted)
   */
  generatedImagesArray: () => {
    // Get raw data first to avoid creating Proxies during iteration
    const images = store$.generatedImages.get();
    return Object.values(images).filter((img) => !img.deletedAt);
  },

  /**
   * Get outfits for the current model
   */
  currentModelOutfits: () => {
    const modelId = store$.preferences.selectedModelId.get();
    if (!modelId) return [];

    // Get raw data first to avoid creating Proxies during iteration
    const outfits = store$.outfits.get();
    return Object.values(outfits).filter(
      (outfit) => outfit.modelId === modelId && !outfit.deletedAt,
    );
  },
};

// ============================================================================
// Actions
// ============================================================================

/**
 * Actions for modifying the store
 * These are the primary API for interacting with app state
 */
const actions = {
  // --------------------------------------------------------------------------
  // Model Actions
  // --------------------------------------------------------------------------

  /**
   * Add a new model image
   */
  addModel: async (filePath: string, source: ImageSource): Promise<string> => {
    try {
      const id = generateId();
      const filename = filePath.split('/').pop() || `model-${id}.jpg`;
      const destDir = `${FileSystem.documentDirectory}${paths.fileSystem.models}/`;
      const destPath = `${destDir}${filename}`;

      // Ensure directory exists
      const dirInfo = await FileSystem.getInfoAsync(destDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });
      }

      // Copy file
      await FileSystem.copyAsync({
        from: filePath,
        to: destPath,
      });

      const model: ModelImage = {
        id,
        name: null,
        mimeType: 'image/jpeg',
        source,
        filePath: destPath,
        isCurrent: Object.keys(store$.models.get()).length === 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      store$.models[id].set(model);

      // Set as current if it's the first model
      if (model.isCurrent) {
        store$.preferences.selectedModelId.set(id);
      }

      return id;
    } catch (error) {
      console.error('Error adding model:', error);
      throw error;
    }
  },

  /**
   * Set the current model
   */
  setCurrentModel: (id: string) => {
    // Set all models to not current
    Object.keys(store$.models.get()).forEach((modelId) => {
      store$.models[modelId].isCurrent.set(false);
    });

    // Set selected model to current
    store$.models[id].isCurrent.set(true);
    store$.preferences.selectedModelId.set(id);
  },

  /**
   * Update model metadata
   */
  updateModel: (id: string, updates: Partial<Pick<ModelImage, 'name'>>) => {
    const model = store$.models[id].peek();
    if (model) {
      store$.models[id].assign({
        ...updates,
        updatedAt: new Date(),
      });
    }
  },

  /**
   * Remove a model (soft delete)
   */
  removeModel: (id: string) => {
    const model = store$.models[id].peek();
    if (model) {
      store$.models[id].deletedAt.set(new Date());
      store$.models[id].updatedAt.set(new Date());

      // If this was the current model, clear selection
      if (store$.preferences.selectedModelId.peek() === id) {
        store$.preferences.selectedModelId.set(null);
      }
    }
  },

  /**
   * Permanently delete a model
   */
  deleteModelPermanently: async (id: string) => {
    const model = store$.models[id].peek();
    if (model) {
      // Delete file from filesystem
      try {
        await FileSystem.deleteAsync(model.filePath, { idempotent: true });
      } catch (error) {
        console.error('Error deleting model file:', error);
      }

      // Remove from store
      store$.models[id].delete();

      // If this was the current model, clear selection
      if (store$.preferences.selectedModelId.peek() === id) {
        store$.preferences.selectedModelId.set(null);
      }
    }
  },

  // --------------------------------------------------------------------------
  // Garment Actions
  // --------------------------------------------------------------------------

  /**
   * Add a new garment
   */
  addGarment: async (filePath: string, type: GarmentType, source: ImageSource): Promise<string> => {
    const id = generateId();
    const filename = filePath.split('/').pop() || `garment-${id}.jpg`;
    const destDir = `${FileSystem.documentDirectory}${paths.fileSystem.garments[type]}/`;
    const destPath = `${destDir}${filename}`;

    // Ensure directory exists
    const dirInfo = await FileSystem.getInfoAsync(destDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });
    }

    // Copy file
    await FileSystem.copyAsync({
      from: filePath,
      to: destPath,
    });

    const garment: GarmentImage = {
      id,
      name: null,
      mimeType: 'image/jpeg',
      source,
      filePath: destPath,
      type,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    store$.garments[type][id].set(garment);

    return id;
  },

  /**
   * Update garment metadata
   */
  updateGarment: (id: string, type: GarmentType, updates: Partial<Pick<GarmentImage, 'name'>>) => {
    const garment = store$.garments[type][id].peek();
    if (garment) {
      store$.garments[type][id].assign({
        ...updates,
        updatedAt: new Date(),
      });
    }
  },

  /**
   * Remove a garment (soft delete)
   */
  removeGarment: (id: string, type: GarmentType) => {
    const garment = store$.garments[type][id].peek();
    if (garment) {
      store$.garments[type][id].deletedAt.set(new Date());
      store$.garments[type][id].updatedAt.set(new Date());

      // Remove from selection if selected
      const selectedIds = store$.ui.selectedGarmentIds.peek();
      if (selectedIds.includes(id)) {
        store$.ui.selectedGarmentIds.set(selectedIds.filter((gId) => gId !== id));
      }
    }
  },

  /**
   * Permanently delete a garment
   */
  deleteGarmentPermanently: async (id: string, type: GarmentType) => {
    const garment = store$.garments[type][id].peek();
    if (garment) {
      // Delete file from filesystem
      try {
        await FileSystem.deleteAsync(garment.filePath, { idempotent: true });
      } catch (error) {
        console.error('Error deleting garment file:', error);
      }

      // Remove from store
      store$.garments[type][id].delete();

      // Remove from selection if selected
      const selectedIds = store$.ui.selectedGarmentIds.peek();
      if (selectedIds.includes(id)) {
        store$.ui.selectedGarmentIds.set(selectedIds.filter((gId) => gId !== id));
      }
    }
  },

  // --------------------------------------------------------------------------
  // Selection Actions
  // --------------------------------------------------------------------------

  /**
   * Toggle garment selection
   */
  toggleGarmentSelection: (id: string, isSelected?: boolean) => {
    const selected = store$.ui.selectedGarmentIds.get();

    if (typeof isSelected === 'boolean') {
      if (isSelected && !selected.includes(id)) {
        store$.ui.selectedGarmentIds.push(id);
      } else if (!isSelected && selected.includes(id)) {
        store$.ui.selectedGarmentIds.set(selected.filter((gId) => gId !== id));
      }
      return;
    }

    if (selected.includes(id)) {
      store$.ui.selectedGarmentIds.set(selected.filter((gId) => gId !== id));
    } else {
      store$.ui.selectedGarmentIds.push(id);
    }
  },

  /**
   * Set selected garments
   */
  setSelectedGarments: (ids: string[]) => {
    store$.ui.selectedGarmentIds.set(ids);
  },

  /**
   * Clear garment selection
   */
  clearGarmentSelection: () => {
    store$.ui.selectedGarmentIds.set([]);
  },

  // --------------------------------------------------------------------------
  // Generated Image Actions
  // --------------------------------------------------------------------------

  /**
   * Add a generated image
   */
  addGeneratedImage: (
    filePath: string,
    modelId: string,
    garmentIds: string[],
    metadata?: GeneratedImage['metadata'],
  ): string => {
    const id = generateId();

    const image: GeneratedImage = {
      id,
      name: null,
      mimeType: 'image/jpeg',
      filePath,
      modelId,
      garmentIds,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    store$.generatedImages[id].set(image);

    return id;
  },

  /**
   * Update generated image metadata
   */
  updateGeneratedImage: (
    id: string,
    updates: Partial<Pick<GeneratedImage, 'name' | 'metadata'>>,
  ) => {
    const image = store$.generatedImages[id].peek();
    if (image) {
      store$.generatedImages[id].assign({
        ...updates,
        updatedAt: new Date(),
      });
    }
  },

  /**
   * Remove a generated image (soft delete)
   */
  removeGeneratedImage: (id: string) => {
    const image = store$.generatedImages[id].peek();
    if (image) {
      store$.generatedImages[id].deletedAt.set(new Date());
      store$.generatedImages[id].updatedAt.set(new Date());
    }
  },

  /**
   * Permanently delete a generated image
   */
  deleteGeneratedImagePermanently: async (id: string) => {
    const image = store$.generatedImages[id].peek();
    if (image) {
      // Delete file from filesystem
      try {
        await FileSystem.deleteAsync(image.filePath, { idempotent: true });
      } catch (error) {
        console.error('Error deleting generated image file:', error);
      }

      // Remove from store
      store$.generatedImages[id].delete();
    }
  },

  // --------------------------------------------------------------------------
  // Onboarding Actions
  // --------------------------------------------------------------------------

  /**
   * Complete onboarding
   */
  completeOnboarding: () => {
    store$.onboarding.isCompleted.set(true);
  },

  /**
   * Set onboarding step
   */
  setOnboardingStep: (path: string) => {
    store$.onboarding.currentStep.set(path);
  },

  /**
   * Reset onboarding
   */
  resetOnboarding: () => {
    store$.onboarding.isCompleted.set(false);
    store$.onboarding.currentStep.set('/onboarding/welcome');
  },

  // --------------------------------------------------------------------------
  // Auth Actions
  // --------------------------------------------------------------------------

  /**
   * Set authentication token
   */
  setAuthToken: (token: string) => {
    store$.auth.token.set(token);
  },

  /**
   * Set authentication identity
   */
  setAuthIdentity: (token: string, userId: string) => {
    store$.auth.token.set(token);
    store$.auth.userId.set(userId);
  },

  /**
   * Set installation id
   */
  setInstallationId: (installationId: string) => {
    store$.auth.installationId.set(installationId);
  },

  /**
   * Get existing installation id or create one
   */
  getOrCreateInstallationId: () => {
    const existingInstallationId = store$.auth.installationId.peek();

    if (existingInstallationId) {
      return existingInstallationId;
    }

    const installationId = generateId();
    store$.auth.installationId.set(installationId);

    return installationId;
  },

  /**
   * Set authentication user id
   */
  setAuthUserId: (userId: string | null) => {
    store$.auth.userId.set(userId);
  },

  /**
   * Clear authentication token
   */
  clearAuthToken: () => {
    store$.auth.token.set(null);
  },

  /**
   * Clear authentication identity
   */
  clearAuthIdentity: () => {
    store$.auth.token.set(null);
    store$.auth.userId.set(null);
  },

  /**
   * Reset the whole app state to defaults
   */
  resetAppData: () => {
    store$.models.set({});
    store$.garments.top.set({});
    store$.garments.bottom.set({});
    store$.generatedImages.set({});
    store$.outfits.set({});

    store$.onboarding.isCompleted.set(false);
    store$.onboarding.currentStep.set('/onboarding/welcome');

    store$.preferences.selectedModelId.set(null);
    store$.auth.token.set(null);
    store$.auth.userId.set(null);
    store$.auth.installationId.set(null);
    store$.ui.selectedGarmentIds.set([]);
  },
};

// ============================================================================
// Unified Export
// ============================================================================

/**
 * Main state API
 * Provides access to the store, computed values, and actions
 */
export const state = {
  // Raw store access
  store: store$,

  // Computed values
  computed,

  // Actions
  actions,
};

// For backward compatibility and convenience
export { actions };
