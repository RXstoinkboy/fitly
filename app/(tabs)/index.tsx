import { Button, Text, YStack, Image, Sheet } from "@/components/ui";
import { useModelImage } from "@/hooks/model-image";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

export default function HomeScreen() {
  const [open, setOpen] = useState(false);
  const showDrawer = () => setOpen(true);

  const { modelImage, saveModelImage } = useModelImage();

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      saveModelImage(result.assets[0].uri);
    }
  };

  const takeImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      saveModelImage(result.assets[0].uri);
    }
  };

  return (
    <>
      <YStack alignItems="center" justifyContent="center" height="100%">
        {modelImage ? (
          <YStack width={"100%"} flex={1} alignItems="center">
            <Button onPress={showDrawer}>Change picture</Button>

            <Image
              source={{ uri: modelImage, width: 200, height: 200 }}
              width="100%"
              height="auto"
              aspectRatio={3 / 4}
            />
          </YStack>
        ) : (
          <YStack>
            <Text>
              No photo. Please choose your photo from gallery or take one with
              your camera
            </Text>
            <YStack>
              <Button onPress={pickImage} background={"$accent"}>
                Choose photo
              </Button>
              <Button onPress={takeImage} background={"$accent"}>
                Take photo
              </Button>
            </YStack>
          </YStack>
        )}
      </YStack>
      <Sheet
        forceRemoveScrollEnabled={open}
        open={open}
        onOpenChange={setOpen}
        dismissOnSnapToBottom
        zIndex={100_000}
        animation="medium"
      >
        <Sheet.Overlay
          animation="lazy"
          backgroundColor="$shadow6"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Sheet.Handle />
        <Sheet.Frame
          padding="$4"
          justifyContent="center"
          alignItems="center"
          gap="$5"
        >
          <Button onPress={pickImage} background={"$accent"}>
            Choose photo
          </Button>
          <Button onPress={takeImage} background={"$accent"}>
            Take photo
          </Button>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
