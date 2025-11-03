import { OnboardingStep } from "@/lib/onboarding/types";
import { useMutation } from "@tanstack/react-query";
import { onboardingKeys } from "./keys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ONBOARDING_STEP_KEY } from "@/lib/onboarding/constants";

export const useUpdateStep = () => {
    return useMutation({
        mutationKey: onboardingKeys.step.update(),
        mutationFn: async (step: OnboardingStep) => {
            return AsyncStorage.setItem(ONBOARDING_STEP_KEY, step);
        },
    })
}