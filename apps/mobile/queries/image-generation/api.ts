import { clearAuthIdentity, getOrCreateToken } from '../auth/api';
import { ImageGenerationInput } from './types';
import { buildBackendHeaders } from '../backend-headers';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const generateImage = async (payload: ImageGenerationInput) => {
  if (!API_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured.');
  }
  const token = await getOrCreateToken();

  const { isSubscribed, ...requestPayload } = payload;

  const headers = buildBackendHeaders({ token, isSubscribed });

  const response = await fetch(`${API_URL}/api/v1/images/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestPayload),
  });

  // Handle monthly usage limit exceeded
  if (response.status === 429) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.message || `Monthly generation limit reached (200/month). Subscribe for unlimited access.`);
  }

  if (response.status === 401) {
    await clearAuthIdentity();
    const regeneratedToken = await getOrCreateToken();

    // Retry the request with the new token
    const retryResponse = await fetch(`${API_URL}/api/v1/images/generate`, {
      method: 'POST',
      headers: buildBackendHeaders({ token: regeneratedToken, isSubscribed }),
      body: JSON.stringify(requestPayload),
    });

    if (!retryResponse.ok) {
      const errorData = await retryResponse
        .json()
        .catch(() => ({ error: retryResponse.statusText }));
      throw new Error(
        retryResponse.status === 429
          ? errorData.message || `Monthly generation limit reached (200/month). Subscribe for unlimited access.`
          : errorData.error || `Unauthorized: Request failed with status ${retryResponse.status}`,
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
