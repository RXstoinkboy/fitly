import { H6, Paragraph, XStack, YStack } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChoosePhoto } from "@/components/ui/choose-photo";
import { TakePhoto } from "@/components/ui/take-photo";
import { Stack, useLocalSearchParams } from "expo-router";
import { useAddGarment } from "@/queries/garments/add-garment";
import { useGetGarmentsList } from "@/queries/garments/get-garments-list";

export default function GarmentsPicker() {
  const params = useLocalSearchParams();
  const type = params.type as string;
  const addGarment = useAddGarment({ type });
  const getGarmentsList = useGetGarmentsList({ type });

  const titleMap = {
    top: "Select top garment",
    bottom: "Select bottom garment",
  };

  const title =
    titleMap[type as unknown as keyof typeof titleMap] || "Select garment";

  return (
    <>
      <Stack.Screen options={{ title }} />
      <SafeAreaView flex={1}>
        <YStack gap={"$6"} px={"$2"}>
          <YStack gap={"$2"}>
            <H6>Add new</H6>
            <XStack gap={"$2"}>
              <ChoosePhoto onSuccess={addGarment.mutate} />
              <TakePhoto onSuccess={addGarment.mutate} />
            </XStack>
          </YStack>

          <YStack gap={"$2"}>
            <H6>Or select existing one</H6>
            {getGarmentsList.data?.length ? (
              <YStack gap={"$2"}>
                {getGarmentsList.data?.map((garment) => (
                  <Paragraph key={garment}>{garment}</Paragraph>
                ))}
              </YStack>
            ) : (
              <Paragraph>No garments found</Paragraph>
            )}
          </YStack>
        </YStack>
      </SafeAreaView>
    </>
  );
}
