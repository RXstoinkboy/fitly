import { PropsWithChildren, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  addCustomerInfoListener,
  configureRevenueCat,
  fetchSubscriptionStatus,
} from '@/lib/subscription';
import { subscriptionKeys } from '@/queries/subscription';

export const SubscriptionProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    configureRevenueCat()
      .then(async () => {
        await queryClient.prefetchQuery({
          queryKey: subscriptionKeys.status(),
          queryFn: fetchSubscriptionStatus,
        });

        unsubscribe = addCustomerInfoListener(() => {
          queryClient.invalidateQueries({ queryKey: subscriptionKeys.status() });
        });
      })
      .catch((error) => {
        console.warn('RevenueCat initialization failed', error);
      });

    return () => {
      unsubscribe?.();
    };
  }, [queryClient]);

  return children;
};
