const PLACEHOLDER_KEY = 'POSTHOG_API_KEY_PLACEHOLDER';

export const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || PLACEHOLDER_KEY;
export const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

export const isPosthogConfigured =
  Boolean(POSTHOG_API_KEY) && POSTHOG_API_KEY !== PLACEHOLDER_KEY;
