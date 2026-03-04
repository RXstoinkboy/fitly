import { state } from '@/state';
import { getOrCreateToken } from '../auth/api';
import { ImageGenerationInput } from './types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

export const generateImage = async (payload: ImageGenerationInput) => {
  if (!API_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured.');
  }
  const token = await getOrCreateToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }

  const response = await fetch(`${API_URL}/api/v1/images/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    state.actions.clearAuthToken();
    const regeneratedToken = await getOrCreateToken();

    // Retry the request with the new token
    const retryResponse = await fetch(`${API_URL}/api/v1/images/generate`, {
      method: 'POST',
      headers: {
        ...headers,
        Authorization: `Bearer ${regeneratedToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!retryResponse.ok) {
      const errorData = await retryResponse
        .json()
        .catch(() => ({ error: retryResponse.statusText }));
      throw new Error(
        errorData.error || `Unauthorized: Request failed with status ${retryResponse.status}`,
      );
    }
    return retryResponse.json();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
};
