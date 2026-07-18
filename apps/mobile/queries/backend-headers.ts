import { state } from '@/state';

const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

type BuildBackendHeadersInput = {
  token?: string;
  contentType?: string;
};

export const buildBackendHeaders = ({
  token,
  contentType = 'application/json',
}: BuildBackendHeadersInput = {}): Record<string, string> => {
  const installationId = state.actions.getOrCreateInstallationId();

  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'x-installation-id': installationId,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }

  return headers;
};
