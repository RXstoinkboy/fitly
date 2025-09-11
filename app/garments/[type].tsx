import { H6, Paragraph, XStack, YStack } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChoosePhoto } from "@/components/ui/choose-photo";
import { TakePhoto } from "@/components/ui/take-photo";
import { Stack, useLocalSearchParams } from "expo-router";

export default function GarmentsPicker() {
  const { type } = useLocalSearchParams();

  const titleMap = {
    top: "Select top garment",
    bottom: "Select bottom garment",
  };

  const title = titleMap[type as unknown as keyof typeof titleMap] || "Eat";

  return (
    <>
      <Stack.Screen options={{ title }} />
      <SafeAreaView flex={1}>
        <YStack gap={"$6"} px={"$2"}>
          <YStack gap={"$2"}>
            <H6>Add new</H6>
            <XStack gap={"$2"}>
              <ChoosePhoto />
              <TakePhoto />
            </XStack>
          </YStack>

          <YStack gap={"$2"}>
            <H6>Or select existing one</H6>
            <XStack gap={"$2"}>
              <Paragraph>List już dodanych</Paragraph>
            </XStack>
          </YStack>
        </YStack>
      </SafeAreaView>
    </>
  );
}
