import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  defaultSubscriptionStatus,
  fetchSubscriptionStatus,
  presentRevenueCatPaywall,
  presentRevenueCatPaywallIfNeeded,
} from '@/lib/subscription';
import { subscriptionKeys, useSubscriptionStatus } from '@/queries/subscription';
import { PAYWALL_RESULT } from 'react-native-purchases-ui';

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

  const showPaywall = useCallback(async () => {
    setIsPresenting(true);
    try {
      const result = await presentRevenueCatPaywall();
      await refreshStatus();
      return result;
    } catch (error) {
      console.warn('Unable to open paywall', error);
      return { paywallResult: PAYWALL_RESULT.ERROR, status };
    } finally {
      setIsPresenting(false);
    }
  }, [refreshStatus, status]);

  const requireSubscription = useCallback(async () => {
    if (status.isSubscribed) {
      return true;
    }

    setIsPresenting(true);
    try {
      const result = await presentRevenueCatPaywallIfNeeded();
      const latest = await refreshStatus();
      return result.paywallResult === PAYWALL_RESULT.NOT_PRESENTED
        ? latest.isSubscribed
        : result.status.isSubscribed || latest.isSubscribed;
    } catch (error) {
      console.warn('Subscription requirement check failed', error);
      return false;
    } finally {
      setIsPresenting(false);
    }
  }, [refreshStatus, status.isSubscribed]);

  return {
    status,
    isPresenting,
    isChecking: isLoading || isFetching,
    requireSubscription,
    showPaywall,
  };
};
