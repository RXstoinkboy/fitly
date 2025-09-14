import { YStack, Image, XStack, H6, View } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Button,
  AddModelPhoto,
  GenerateImageButton,
  ImagesCarousel,
} from "@/components/ui";
import { Link } from "expo-router";
import { useGetModelsList } from "@/queries/models/get-models-list";
import { Shirt } from "@tamagui/lucide-icons";
import { useContext, useState } from "react";
import { GarmentsContext } from "@/context/garment-context";
import { useGetGeneratedImagesList } from "@/queries/image-generation/get-generated-images-list";
import * as FileSystem from "expo-file-system";
import { paths } from "@/constants/paths";

export default function HomeScreen() {
  const models = useGetModelsList();
  const generatedImages = useGetGeneratedImagesList();
  const { bottom, top } = useContext(GarmentsContext);
  const images = [...(models.data ?? []), ...(generatedImages.data ?? [])];
  const [galleryWrapperHeight, setGalleryWrapperHeight] = useState(0);

  console.log("generatedImages", generatedImages.data);

  const debugFn = async () => {
    console.log(
      "debugFn called",
      `${FileSystem.documentDirectory}${paths.fileSystem.generated}`,
    );
    const info = await FileSystem.getInfoAsync(
      `${FileSystem.documentDirectory}${paths.fileSystem.generated}`,
    );
    console.log("info", info);
    const dir = await FileSystem.readDirectoryAsync(
      `${FileSystem.documentDirectory}${paths.fileSystem.generated}`,
    );
    console.log("dir", dir);
  };
  return (
    <SafeAreaView height={"100%"}>
      {/*<Button onPress={debugFn}>Debug</Button>*/}
      <YStack flex={1}>
        {!models.data?.length ? (
          <AddModelPhoto />
        ) : (
          <YStack flex={1} minW={"100%"}>
            {/*<XStack
              width={"100%"}
              flex={1}
              p="$4"p
              borderWidth={1}
              borderStyle="solid"
              borderColor={"$red8"}
            >*/}
            {/*{images.map((model) => {
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
              })}*/}
            <View
              flex={1}
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                setGalleryWrapperHeight(height);
              }}
            >
              <ImagesCarousel height={galleryWrapperHeight} images={images} />
            </View>
            {/*</XStack>*/}
            {models.data?.length ? (
              <YStack
                gap="$4"
                // minW={"100%"}
                items={"center"}
                px="$4"
                borderWidth={1}
                borderColor={"$accent8"}
              >
                <GenerateImageButton />
                <YStack gap={"$2"}>
                  <H6>Select garments</H6>
                  <XStack gap="$2" width={"100%"} justify="space-evenly">
                    <Link href="/garments/top" asChild>
                      <Button
                        flex={1}
                        icon={() =>
                          top ? (
                            <Image
                              source={{ uri: top, height: 80, width: 80 }}
                            />
                          ) : (
                            <Shirt />
                          )
                        }
                      >
                        Top
                      </Button>
                    </Link>
                    <Link href="/garments/bottom" asChild>
                      <Button
                        flex={1}
                        icon={() =>
                          bottom ? (
                            <Image
                              source={{ uri: bottom, height: 80, width: 80 }}
                            />
                          ) : null
                        }
                      >
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
