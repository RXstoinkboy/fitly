import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  defaultSubscriptionStatus,
  fetchSubscriptionStatus,
  presentRevenueCatCustomerCenter,
  presentRevenueCatPaywall,
  presentRevenueCatPaywallIfNeeded,
} from '@/lib/subscription';
import { subscriptionKeys, useSubscriptionStatus } from '@/queries/subscription';
import { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { analyticsEvents, captureError, trackEvent } from '@/lib/analytics';
import { AnalyticsFlow } from '@/lib/analytics/types';

export const usePaywall = () => {
  const queryClient = useQueryClient();
  const { data, isFetching, isLoading } = useSubscriptionStatus();
  const [isPresenting, setIsPresenting] = useState(false);

  const status = useMemo(() => data ?? defaultSubscriptionStatus, [data]);

  const refreshStatus = useCallback(async () => {
    return queryClient.fetchQuery({
      queryKey: subscriptionKeys.status(),
      queryFn: fetchSubscriptionStatus,
    });
  }, [queryClient]);

  const trackPaywallResult = useCallback(
    (context: string, result: PAYWALL_RESULT, latestStatus = status) => {
      trackEvent(analyticsEvents.paywall.result(context), {
        paywallResult: result,
        isSubscribed: latestStatus.isSubscribed,
        activeEntitlementId: latestStatus.activeEntitlementId,
      });
    },
    [status],
  );

  const showPaywall = useCallback(
    async (context: AnalyticsFlow | string = 'app') => {
      setIsPresenting(true);
      trackEvent(analyticsEvents.paywall.shown(context), {
        isSubscribed: status.isSubscribed,
      });

      try {
        const result = await presentRevenueCatPaywall();
        const latest = await refreshStatus();
        const finalStatus = result.status ?? latest ?? status;
        trackPaywallResult(context, result.paywallResult, finalStatus);
        return { ...result, status: finalStatus };
      } catch (error) {
        console.warn('Unable to open paywall', error);
        captureError(error, {
          event: analyticsEvents.paywall.result(context, PAYWALL_RESULT.ERROR),
          flow: context,
        });
        trackPaywallResult(context, PAYWALL_RESULT.ERROR, status);
        return { paywallResult: PAYWALL_RESULT.ERROR, status };
      } finally {
        setIsPresenting(false);
      }
    },
    [refreshStatus, status, trackPaywallResult],
  );

  const requireSubscription = useCallback(
    async (context: AnalyticsFlow | string = 'app') => {
      if (status.isSubscribed) {
        trackEvent(analyticsEvents.paywall.requirementOutcome(context, 'allowed'), {
          isSubscribed: true,
        });
        return true;
      }

      setIsPresenting(true);
      trackEvent(analyticsEvents.paywall.shown(context), {
        isSubscribed: status.isSubscribed,
      });

      try {
        const result = await presentRevenueCatPaywallIfNeeded();
        const latest = await refreshStatus();
        const isAllowed =
          result.paywallResult === PAYWALL_RESULT.NOT_PRESENTED
            ? latest.isSubscribed
            : result.status.isSubscribed || latest.isSubscribed;
        trackPaywallResult(context, result.paywallResult, result.status ?? latest);
        trackEvent(
          analyticsEvents.paywall.requirementOutcome(context, isAllowed ? 'allowed' : 'blocked'),
          {
            paywallResult: result.paywallResult,
            isSubscribed: isAllowed,
          },
        );
        return isAllowed;
      } catch (error) {
        console.warn('Subscription requirement check failed', error);
        captureError(error, {
          event: analyticsEvents.paywall.requirementOutcome(context, 'blocked'),
          flow: context,
        });
        trackEvent(analyticsEvents.paywall.requirementOutcome(context, 'blocked'), {
          paywallResult: PAYWALL_RESULT.ERROR,
          isSubscribed: false,
        });
        return false;
      } finally {
        setIsPresenting(false);
      }
    },
    [refreshStatus, status, trackPaywallResult],
  );

  const openCustomerCenter = useCallback(
    async (context: AnalyticsFlow | string = 'settings') => {
      setIsPresenting(true);
      trackEvent(analyticsEvents.paywall.customerCenterOpened(context));

      try {
        const result = await presentRevenueCatCustomerCenter();
        await refreshStatus();
        return result;
      } catch (error) {
        console.warn('Unable to open subscription management', error);
        captureError(error, {
          event: analyticsEvents.paywall.customerCenterOpened(context),
          flow: context,
        });
        return { opened: false as const, source: 'none' as const };
      } finally {
        setIsPresenting(false);
      }
    },
    [refreshStatus],
  );

  return {
    status,
    isPresenting,
    isChecking: isLoading || isFetching,
    requireSubscription,
    showPaywall,
    openCustomerCenter,
  };
};
