import { ImageGenerationInput } from './types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

export const generateImage = async (payload: ImageGenerationInput) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }

  const response = await fetch(`${API_URL}/api/generate-image`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
};
