import PostHog from 'posthog-react-native';
import { isPosthogConfigured, POSTHOG_API_KEY, POSTHOG_HOST } from './config';

export const posthogClient = isPosthogConfigured
  ? new PostHog(POSTHOG_API_KEY, {
      host: POSTHOG_HOST,
      // Enable useful defaults for mobile apps
      captureAppLifecycleEvents: true,
      // Faster flush while on free tier; can be tuned later
      flushAt: 1,
    })
  : null;
