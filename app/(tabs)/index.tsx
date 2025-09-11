import { YStack, Image, XStack, H6 } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, AddModelPhoto, GenerateImageButton } from "@/components/ui";
import { Link } from "expo-router";
import { useGetModelsList } from "@/queries/models/get-models-list";
import { Shirt } from "@tamagui/lucide-icons";

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
              <YStack gap="$4" minW={"100%"} px="$4">
                <GenerateImageButton />
                <YStack gap={"$2"}>
                  <H6>Select garments</H6>
                  <XStack gap="$2" width={"100%"} justify={"space-evenly"}>
                    <Link href="/garments/top" asChild>
                      <Button flex={1} icon={Shirt} card="outlined">
                        Top
                      </Button>
                    </Link>
                    <Link href="/garments/bottom" asChild>
                      <Button flex={1} card="outlined">
                        Bottom
                      </Button>
                    </Link>
                  </XStack>
                </YStack>
              </YStack>
            ) : null}
          </YStack>
        )}
      </YStack>
    </SafeAreaView>
  );
}
