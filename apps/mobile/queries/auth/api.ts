import { state } from '@/state';
import { setRevenueCatAppUser } from '@/lib/subscription';
import { buildBackendHeaders } from '../backend-headers';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type AnonymousAuthResponse = {
  token: string;
  userId: string;
};

export type AuthIdentity = {
  token: string;
  userId: string;
};

let pendingAnonymousAuth: Promise<AuthIdentity> | null = null;
let syncedRevenueCatUserId: string | null = null;

const syncRevenueCatAppUser = async (userId: string | null) => {
  if (syncedRevenueCatUserId === userId) {
    return;
  }

  try {
    await setRevenueCatAppUser(userId);
    syncedRevenueCatUserId = userId;
  } catch (error) {
    console.warn('Failed to sync RevenueCat app user', error);
  }
};

const authenticateAnonymously = async (): Promise<AuthIdentity> => {
  if (!API_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured.');
  }

  const headers = buildBackendHeaders();

  const response = await fetch(`${API_URL}/api/v1/auth/anonymous`, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  const data = (await response.json()) as Partial<AnonymousAuthResponse>;

  if (!data.token || typeof data.token !== 'string') {
    throw new Error('Anonymous auth response is missing a valid token.');
  }

  if (!data.userId || typeof data.userId !== 'string') {
    throw new Error('Anonymous auth response is missing a valid userId.');
  }

  state.actions.setAuthIdentity(data.token, data.userId);
  await syncRevenueCatAppUser(data.userId);

  return {
    token: data.token,
    userId: data.userId,
  };
};

export const getOrCreateAuthIdentity = async (): Promise<AuthIdentity> => {
  state.actions.getOrCreateInstallationId();

  const token = state.store.auth.token.get();
  const userId = state.store.auth.userId.get();

  if (token && userId) {
    await syncRevenueCatAppUser(userId);
    return { token, userId };
  }

  if (pendingAnonymousAuth) {
    return pendingAnonymousAuth;
  }

  pendingAnonymousAuth = authenticateAnonymously();

  try {
    return await pendingAnonymousAuth;
  } finally {
    pendingAnonymousAuth = null;
  }
};

export const getOrCreateToken = async (): Promise<string> => {
  const identity = await getOrCreateAuthIdentity();
  return identity.token;
};

export const clearAuthIdentity = async (): Promise<void> => {
  state.actions.clearAuthIdentity();
  await syncRevenueCatAppUser(null);
};
