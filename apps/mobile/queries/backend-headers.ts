import { state } from '@/state';

const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

type BuildBackendHeadersInput = {
  token?: string;
  contentType?: string;
  isSubscribed?: boolean;
};

export const buildBackendHeaders = ({
  token,
  contentType = 'application/json',
  isSubscribed,
}: BuildBackendHeadersInput = {}): Record<string, string> => {
  const installationId = state.actions.getOrCreateInstallationId();

  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'x-installation-id': installationId,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (isSubscribed !== undefined) {
    headers['x-is-subscribed'] = isSubscribed ? 'true' : 'false';
  }

  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }

  return headers;
};
