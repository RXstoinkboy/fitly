import { PropsWithChildren, useEffect } from 'react';
import { PostHogProvider } from 'posthog-react-native';
import { analyticsEvents } from './events';
import { posthogClient } from './client';
import { registerErrorHandlers } from './error-handlers';
import { trackEvent } from './track';

export const AnalyticsProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    if (!posthogClient) return;

    registerErrorHandlers();
    trackEvent(analyticsEvents.app.launched());
  }, []);

  if (!posthogClient) {
    return <>{children}</>;
  }

  return <PostHogProvider client={posthogClient}>{children}</PostHogProvider>;
};
