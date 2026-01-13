/**
 * Legend-State Type Definitions
 * Local-first state management types for the virtual try-on app
 */

// ============================================================================
// Common Types
// ============================================================================

export type ImageSource = 'camera' | 'library' | 'url';

export type GarmentType = 'top' | 'bottom';

// ============================================================================
// Base Types
// ============================================================================

/**
 * Base properties for all entities in the store
 */
type BaseEntity = {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
};

/**
 * Common properties for all image-based entities
 */
type BaseImage = {
  name: string | null;
  mimeType: string | null;
  filePath: string;
};

// ============================================================================
// Entity Types
// ============================================================================

/**
 * User model photo - the person wearing the clothes
 */
export type ModelImage = BaseEntity &
  BaseImage & {
    source: ImageSource | null;
    isCurrent: boolean;
  };

/**
 * Garment/clothing item
 */
export type GarmentImage = BaseEntity &
  BaseImage & {
    source: ImageSource | null;
    type: GarmentType;
  };

/**
 * AI-generated try-on image
 */
export type GeneratedImage = BaseEntity &
  BaseImage & {
    modelId: string;
    garmentIds: string[];
    metadata?: {
      prompt?: string;
      parameters?: Record<string, any>;
    };
  };

/**
 * Outfit composition (model + garments combination)
 */
export type OutfitImage = BaseEntity &
  BaseImage & {
    description: string | null;
    modelId: string;
    garmentIds: string[];
  };

// ============================================================================
// Store State Type
// ============================================================================

/**
 * Main application state structure
 */
export type AppState = {
  // Data collections (persisted)
  models: Record<string, ModelImage>;
  garments: {
    top: Record<string, GarmentImage>;
    bottom: Record<string, GarmentImage>;
  };
  generatedImages: Record<string, GeneratedImage>;
  outfits: Record<string, OutfitImage>;

  // App metadata (persisted)
  onboarding: {
    isCompleted: boolean;
    currentStep: number;
  };

  // User preferences (persisted)
  preferences: {
    selectedModelId: string | null;
  };

  // UI state (ephemeral - not persisted)
  ui: {
    selectedGarmentIds: string[];
  };
};
