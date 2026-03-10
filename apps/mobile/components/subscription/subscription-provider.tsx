import { PropsWithChildren, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { configureRevenueCat, fetchSubscriptionStatus } from '@/lib/subscription';
import { subscriptionKeys } from '@/queries/subscription';

export const SubscriptionProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    configureRevenueCat()
      .then(() =>
        queryClient.prefetchQuery({
          queryKey: subscriptionKeys.status(),
          queryFn: fetchSubscriptionStatus,
        }),
      )
      .catch((error) => {
        console.warn('RevenueCat initialization failed', error);
      });
  }, [queryClient]);

  return children;
};
