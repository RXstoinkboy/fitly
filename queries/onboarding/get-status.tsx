import { useQuery } from '@tanstack/react-query';
import { onboardingKeys } from './keys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_STATUS_KEY } from '@/lib/onboarding/constants';
import { OnboardingStatus } from '@/lib/onboarding/types';

export const useGetStatus = () => {
  return useQuery({
    queryKey: onboardingKeys.status.get(),
    queryFn: async () => {
      const status = (await AsyncStorage.getItem(ONBOARDING_STATUS_KEY)) as OnboardingStatus;
      return status;
    },
  });
};
