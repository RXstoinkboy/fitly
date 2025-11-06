import { useQuery } from "@tanstack/react-query"
import { onboardingKeys } from "./keys"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { ONBOARDING_STEP_KEY } from "@/lib/onboarding/constants"
import { OnboardingStep } from "@/lib/onboarding/types"

export const useGetStep = () => {
    return useQuery({
        queryKey: onboardingKeys.step.get(),
        queryFn: async () => {
            const step = await AsyncStorage.getItem(ONBOARDING_STEP_KEY) as OnboardingStep;

            return step;
        }
    })
}