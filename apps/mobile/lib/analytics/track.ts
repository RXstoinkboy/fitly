import { Platform } from 'react-native';
import { analyticsEvents } from './events';
import { posthogClient } from './client';

type TrackProperties = Record<string, unknown>;

export const trackEvent = (event: string, properties: TrackProperties = {}) => {
  if (!posthogClient) return;

  posthogClient.capture(event, {
    platform: Platform.OS,
    ...properties,
  });
};

export const captureError = (error: unknown, properties: TrackProperties = {}) => {
  trackEvent(analyticsEvents.errors.captured(), {
    message: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : 'UnknownError',
    stack: error instanceof Error ? error.stack : undefined,
    ...properties,
  });
};
