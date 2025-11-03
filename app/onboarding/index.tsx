import { SafeAreaView } from "react-native-safe-area-context";
import { YStack, Text } from "tamagui";

export default function Onboarding() {
    console.log('rendering onboarding buu');

    return <SafeAreaView style={{ flex: 1 }}><YStack flex={1} borderColor={'$accent12'}><Text>Welcome screen</Text></YStack></SafeAreaView>
}