import { OnboardingStep, OnboardingStatus } from "@/lib/onboarding/types";
import { useUpdateStatus } from "@/queries/onboarding/update-status";
import { useUpdateStep } from "@/queries/onboarding/update-step";
import { ArrowRight } from "@tamagui/lucide-icons";
import { LinkProps, Link } from "expo-router";
import { ReactNode } from "react";
import { Button } from "@/components/v2/ui/button";
import { Text } from "tamagui";

type NextProps = {
    children?: ReactNode,
    href?: LinkProps['href'],
    step?: OnboardingStep,
}

// TODO: this will go to /components
export const Next = ({
    children = 'Next',
    ...props
}: NextProps) => {
    const updateStatus = useUpdateStatus();
    const updateStep = useUpdateStep();

    const onNavigate = () => {
        if (!props.step) {
            return;
        }
        if (props.step === OnboardingStep.Finish) {
            updateStatus.mutate(OnboardingStatus.Completed);
        }

        updateStep.mutate(props.step);
    }

    return (<Link href={props.href ? props.href : `/onboarding/${props.step ?? OnboardingStep.Welcome}`} asChild>
        <Button iconAfter={<ArrowRight />} ghost paddingSize={0} onPress={onNavigate}>
            <Text>{children}</Text>
        </Button>
    </Link>)
}