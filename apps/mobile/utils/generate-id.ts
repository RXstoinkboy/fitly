import { nanoid } from 'nanoid/non-secure';

/**
 * Generate a unique ID for a new entity
 * Uses nanoid (non-secure) for URL-safe, collision-resistant IDs
 * Non-secure version is used for React Native compatibility
 *
 * @returns A unique 21-character ID
 */
export const generateId = (): string => {
  return nanoid();
};
