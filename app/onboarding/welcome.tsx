import { useGetStatus } from "@/queries/onboarding/get-status";
import { YStack, Text } from "tamagui";

export default function Onboarding() {
    return <YStack flex={1} borderColor={'$accent12'}><Text>Welcome screen</Text></YStack>
}