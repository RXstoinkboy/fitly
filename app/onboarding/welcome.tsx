import { useGetStatus } from "@/queries/onboarding/get-status";
import { useGetStep } from "@/queries/onboarding/get-step";
import { YStack, Text } from "tamagui";

export default function Onboarding() {
    const status = useGetStatus();
    const step = useGetStep();

    return <YStack flex={1} borderColor={'$accent12'}><Text>Welcome screen</Text></YStack>
}