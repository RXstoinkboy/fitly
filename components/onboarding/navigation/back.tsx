import { Button } from "@/components/v2/ui/button";
import { OnboardingStep } from "@/lib/onboarding/types";
import { useUpdateStep } from "@/queries/onboarding/update-step";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { Link } from "expo-router";
import { Text } from "tamagui";

export const Back = ({
    step
}: {
    step: OnboardingStep,
}) => {
    const updateStep = useUpdateStep();

    return (<Link href={`/onboarding/${step}`} asChild>
        <Button icon={<ArrowLeft />} ghost paddingSize={0} onPress={() => { updateStep.mutate(step); }}>
            <Text>Back</Text>
        </Button>
    </Link>)
}