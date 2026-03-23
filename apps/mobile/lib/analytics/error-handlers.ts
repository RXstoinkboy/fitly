import { Platform } from 'react-native';
import { analyticsEvents } from './events';
import { trackEvent } from './track';

declare const ErrorUtils: {
  getGlobalHandler?: () => ((error: Error, isFatal: boolean) => void) | undefined;
  setGlobalHandler?: (handler: (error: Error, isFatal: boolean) => void) => void;
};

export const registerErrorHandlers = () => {
  const globalErrorHandler = (ErrorUtils as any)?.getGlobalHandler?.();

  if (globalErrorHandler) {
    (ErrorUtils as any).setGlobalHandler((error: Error, isFatal: boolean) => {
      trackEvent(analyticsEvents.errors.unhandled(), {
        isFatal,
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        platform: Platform.OS,
      });

      globalErrorHandler?.(error, isFatal);
    });
  }

  const unhandledPromiseHandler = (globalThis as any).__unhandledPromiseRejectionHandler;
  if (typeof unhandledPromiseHandler === 'function') {
    (globalThis as any).__unhandledPromiseRejectionHandler = (reason: any, promise: any) => {
      trackEvent(analyticsEvents.errors.promiseRejection(), {
        reason: reason instanceof Error ? reason.message : String(reason),
      });

      unhandledPromiseHandler(reason, promise);
    };
  }
};
