import { clearAuthIdentity, getOrCreateToken } from '../auth/api';
import { ImageGenerationInput } from './types';
import { buildBackendHeaders } from '../backend-headers';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const generateImage = async (payload: ImageGenerationInput) => {
  if (!API_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured.');
  }
  const token = await getOrCreateToken();

  const headers = buildBackendHeaders({ token });

  const response = await fetch(`${API_URL}/api/v1/images/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    await clearAuthIdentity();
    const regeneratedToken = await getOrCreateToken();

    // Retry the request with the new token
    const retryResponse = await fetch(`${API_URL}/api/v1/images/generate`, {
      method: 'POST',
      headers: buildBackendHeaders({ token: regeneratedToken }),
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
