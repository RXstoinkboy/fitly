import { useQuery } from '@tanstack/react-query';
import { fetchSubscriptionStatus } from '@/lib/subscription';
import { subscriptionKeys } from './keys';

export const useSubscriptionStatus = () => {
  return useQuery({
    queryKey: subscriptionKeys.status(),
    queryFn: fetchSubscriptionStatus,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
