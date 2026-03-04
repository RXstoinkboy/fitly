import { state } from '@/state';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

type AnonymousAuthResponse = {
  token: string;
  userId: string;
};

let pendingAnonymousAuth: Promise<string> | null = null;

export const getOrCreateToken = async (): Promise<string> => {
  const token = state.store.auth.token.get();
  if (token) {
    return token;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }

  if (pendingAnonymousAuth) {
    return pendingAnonymousAuth;
  }

  pendingAnonymousAuth = (async () => {
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

    state.actions.setAuthToken(data.token);

    return data.token;
  })();

  try {
    return await pendingAnonymousAuth;
  } finally {
    pendingAnonymousAuth = null;
  }
};
