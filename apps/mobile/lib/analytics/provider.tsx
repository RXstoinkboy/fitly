import { PropsWithChildren, useEffect } from 'react';
import { PostHogProvider } from 'posthog-react-native';
import { analyticsEvents } from './events';
import { posthogClient } from './client';
import { registerErrorHandlers } from './error-handlers';
import { captureError, identifyUser, trackEvent } from './track';
import { getOrCreateAuthIdentity } from '@/queries/auth/api';
import { state } from '@/state';

export const AnalyticsProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    if (!posthogClient) return;

    registerErrorHandlers();

    let cancelled = false;

    const bootstrapIdentity = async () => {
      try {
        const installationId = state.actions.getOrCreateInstallationId();
        const identity = await getOrCreateAuthIdentity();
        if (!cancelled) {
          identifyUser(identity.userId, {
            authType: 'anonymous',
            installationId,
          });
        }
      } catch (error) {
        captureError(error, {
          context: 'startup_auth_bootstrap',
        });
      } finally {
        if (!cancelled) {
          trackEvent(analyticsEvents.app.launched());
        }
      }
    };

    void bootstrapIdentity();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!posthogClient) {
    return <>{children}</>;
  }

  return <PostHogProvider client={posthogClient}>{children}</PostHogProvider>;
};
