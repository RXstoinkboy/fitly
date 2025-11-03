import { useMutation } from "@tanstack/react-query"
import { onboardingKeys } from "./keys"
import { ONBOARDING_STATUS_KEY } from "@/lib/onboarding/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useUpdateStatus = () => {
    return useMutation({
        mutationKey: onboardingKeys.status.update(),
        mutationFn: async (status: string) => {
            return AsyncStorage.setItem(ONBOARDING_STATUS_KEY, status);
        }

    })
}