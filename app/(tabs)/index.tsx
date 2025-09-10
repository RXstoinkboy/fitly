import {
  Button,
  Text,
  YStack,
  Image,
  Sheet,
  AddImage,
  GenerateImageButton,
} from "@/components/ui";
import {
  useModelImage,
  MODEL_IMAGE_STORAGE_KEY,
} from "@/hooks/use-model-image";
import { Link } from "expo-router";
import { useState } from "react";

export default function HomeScreen() {
  const [open, setOpen] = useState(false);
  const showDrawer = () => setOpen(true);

  const { modelImage, saveModelImage } = useModelImage(MODEL_IMAGE_STORAGE_KEY);

  return (
    <>
      <YStack items="center" justify="center" flex={1}>
        {modelImage ? (
          <YStack width={"100%"} flex={1} items="center" bg="red">
            <Button onPress={showDrawer}>Change picture</Button>

            <Image
              source={{ uri: modelImage, width: 300, height: 400 }}
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
            <AddImage onSuccess={saveModelImage} />
          </YStack>
        )}
        <YStack gap="$2" p="$4" width={"100%"}>
          <GenerateImageButton />
          <Link href="/garments-picker" asChild>
            <Button variant="outlined">Garments Picker</Button>
          </Link>
        </YStack>
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
          bg="$shadow6"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Sheet.Handle />
        <Sheet.Frame p="$4" justify="center" items="center" gap="$5">
          <AddImage onSuccess={saveModelImage} />
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
