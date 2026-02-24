/**
 * State Management Entry Point
 *
 * Local-first state management using Legend-State with MMKV persistence
 */

export { state, actions, store$ } from './store';
export * from './hooks';
export * from './types';
export { generateId } from '../utils/generate-id';
