import { Platform } from 'react-native';
import { analyticsEvents } from './events';
import { posthogClient } from './client';

type TrackProperties = Record<string, unknown>;

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type IdentifyProperties = Record<string, JsonValue>;

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

export const identifyUser = (userId: string, properties: IdentifyProperties = {}) => {
  if (!posthogClient || !userId) return;

  posthogClient.identify(userId, properties as any);
};
