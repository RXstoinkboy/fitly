import { YStack, Image, XStack } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, AddModelPhoto, GenerateImageButton } from "@/components/ui";
import { Link } from "expo-router";
import { useGetModelsList } from "@/queries/image-generation/models/get-models-list";

export default function HomeScreen() {
  const models = useGetModelsList();

  return (
    <SafeAreaView flex={1}>
      <YStack items="center" justify="center" flex={1}>
        {!models.data?.length ? (
          <AddModelPhoto />
        ) : (
          <YStack flex={1}>
            <XStack width={"100%"} flex={1} justify="center" p="$4">
              {models.data.map((model) => {
                return (
                  <Image
                    rounded={"$8"}
                    key={model}
                    source={{ uri: model, width: 300, height: 400 }}
                    objectFit="cover"
                    height={"100%"}
                    width={"100%"}
                  />
                );
              })}
            </XStack>
            {models.data?.length ? (
              <YStack gap="$2" minW={"100%"} px="$4">
                <GenerateImageButton />
                <Link href="/garments-picker" asChild>
                  <Button variant="outlined">Garments Picker</Button>
                </Link>
              </YStack>
            ) : null}
          </YStack>
        )}
      </YStack>
    </SafeAreaView>
  );
}
