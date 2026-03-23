/**
 * React Hooks for Legend-State
 * Reactive hooks for accessing state in React components
 */

import { useValue } from '@legendapp/state/react';
import { state } from './store';
import type { GarmentType, ImageSource } from './types';

// ============================================================================
// Model Hooks
// ============================================================================

/**
 * Hook for accessing and managing models
 */
export const useModels = () => {
  const models = useValue(() => state.computed.modelsArray());
  const currentModelId = useValue(state.store.preferences.selectedModelId);
  const currentModel = useValue(() => state.computed.currentModel());

  return {
    models,
    currentModelId,
    currentModel,
    addModel: state.actions.addModel,
    setCurrentModel: state.actions.setCurrentModel,
    updateModel: state.actions.updateModel,
    removeModel: state.actions.removeModel,
    deleteModelPermanently: state.actions.deleteModelPermanently,
  };
};

/**
 * Hook for accessing the current model only
 */
export const useCurrentModel = () => {
  const currentModel = useValue(() => state.computed.currentModel());
  const currentModelId = useValue(state.store.preferences.selectedModelId);

  return {
    currentModel,
    currentModelId,
    setCurrentModel: state.actions.setCurrentModel,
  };
};

// ============================================================================
// Garment Hooks
// ============================================================================

/**
 * Hook for accessing and managing garments of a specific type
 */
export const useGarments = () => {
  const garments = useValue(() => state.computed.garments());
  const selectedIds = useValue(state.store.ui.selectedGarmentIds);

  return {
    garments,
    selectedIds,
    addGarment: (filePath: string, source: ImageSource, type: GarmentType) =>
      state.actions.addGarment(filePath, type, source),
    updateGarment: (
      id: string,
      updates: Parameters<typeof state.actions.updateGarment>[2],
      type: GarmentType,
    ) => state.actions.updateGarment(id, type, updates),
    removeGarment: (id: string, type: GarmentType) => state.actions.removeGarment(id, type),
    deleteGarmentPermanently: (id: string, type: GarmentType) =>
      state.actions.deleteGarmentPermanently(id, type),
    toggleSelection: state.actions.toggleGarmentSelection,
    clearSelection: state.actions.clearGarmentSelection,
  };
};

/**
 * Hook for accessing all top garments
 */
export const useTopGarments = () => {
  const garments = useValue(() => state.computed.topGarments());
  const selectedIds = useValue(state.store.ui.selectedGarmentIds);

  return {
    garments,
    selectedIds,
    addGarment: (filePath: string, source: ImageSource) =>
      state.actions.addGarment(filePath, 'top', source),
    toggleSelection: state.actions.toggleGarmentSelection,
  };
};

/**
 * Hook for accessing all bottom garments
 */
export const useBottomGarments = () => {
  const garments = useValue(() => state.computed.bottomGarments());
  const selectedIds = useValue(state.store.ui.selectedGarmentIds);

  return {
    garments,
    selectedIds,
    addGarment: (filePath: string, source: ImageSource) =>
      state.actions.addGarment(filePath, 'bottom', source),
    toggleSelection: state.actions.toggleGarmentSelection,
  };
};

/**
 * Hook for accessing selected garments
 */
export const useSelectedGarments = () => {
  const selectedGarments = useValue(() => state.computed.selectedGarments());
  const selectedIds = useValue(state.store.ui.selectedGarmentIds);

  return {
    selectedGarments,
    selectedIds,
    toggleSelection: state.actions.toggleGarmentSelection,
    setSelectedGarments: state.actions.setSelectedGarments,
    clearSelection: state.actions.clearGarmentSelection,
  };
};

// ============================================================================
// Generated Image Hooks
// ============================================================================

/**
 * Hook for accessing and managing generated images
 */
export const useGeneratedImages = () => {
  const images = useValue(() => state.computed.generatedImagesArray());
  const currentModelImages = useValue(() => state.computed.currentModelGeneratedImages());

  return {
    images,
    currentModelImages,
    addGeneratedImage: state.actions.addGeneratedImage,
    updateGeneratedImage: state.actions.updateGeneratedImage,
    removeGeneratedImage: state.actions.removeGeneratedImage,
    deleteGeneratedImagePermanently: state.actions.deleteGeneratedImagePermanently,
  };
};

/**
 * Hook for accessing generated images for the current model
 */
export const useCurrentModelGeneratedImages = () => {
  const images = useValue(() => state.computed.currentModelGeneratedImages());

  return {
    images,
    addGeneratedImage: state.actions.addGeneratedImage,
  };
};

// ============================================================================
// Onboarding Hooks
// ============================================================================

/**
 * Hook for accessing and managing onboarding state
 */
export const useOnboarding = () => {
  const isCompleted = useValue(state.store.onboarding.isCompleted);
  const currentStep = useValue(state.store.onboarding.currentStep);

  return {
    isCompleted,
    currentStep,
    completeOnboarding: state.actions.completeOnboarding,
    setOnboardingStep: state.actions.setOnboardingStep,
    resetOnboarding: state.actions.resetOnboarding,
  };
};

// ============================================================================
// Combined Hooks
// ============================================================================

/**
 * Hook for accessing all state needed for the main app
 */
export const useAppState = () => {
  const { currentModel, currentModelId } = useCurrentModel();
  const { selectedGarments, selectedIds } = useSelectedGarments();
  const { images: currentModelImages } = useCurrentModelGeneratedImages();
  const { isCompleted: isOnboardingCompleted } = useOnboarding();

  return {
    currentModel,
    currentModelId,
    selectedGarments,
    selectedGarmentIds: selectedIds,
    generatedImages: currentModelImages,
    isOnboardingCompleted,
  };
};

// ============================================================================
// Auth Hooks
// ============================================================================

/**
 * Hook for accessing authentication state
 */
export const useAuthState = () => {
  const token = useValue(state.store.auth.token);
  const userId = useValue(state.store.auth.userId);

  return {
    token,
    userId,
    setToken: state.actions.setAuthToken,
    setAuthIdentity: state.actions.setAuthIdentity,
    setUserId: state.actions.setAuthUserId,
    clearToken: state.actions.clearAuthToken,
    clearIdentity: state.actions.clearAuthIdentity,
  };
};
