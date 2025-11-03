export const onboardingKeys = {
    all: () => ["onboarding"] as const,
    status: {
        all: () => [...onboardingKeys.all(), "status"] as const,
        get: () => [...onboardingKeys.status.all(), "get"] as const,
        update: () => [...onboardingKeys.status.all(), "update"] as const,
    },
    step: {
        all: () => [...onboardingKeys.all(), "step"] as const,
        get: () => [...onboardingKeys.step.all(), "get"] as const,
        update: () => [...onboardingKeys.step.all(), "update"] as const,
    },
};
