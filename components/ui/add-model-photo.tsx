import { YStack, H5, H6, XStack } from "tamagui";
import { Button } from ".";
import { useAddModel } from "@/queries/image-generation/models/add-model";
import { pickImage } from "@/lib/pick-image-from-file-system";
import { GalleryHorizontalEnd, Camera } from "@tamagui/lucide-icons";
import { takePhoto } from "@/lib/take-photo";

export const AddModelPhoto = () => {
  const addModel = useAddModel();

  const onSelectImage = async () => {
    const image = await pickImage();

    if (image) {
      addModel.mutate(image);
    }
  };

  const onCamera = async () => {
    const image = await takePhoto();

    if (image) {
      addModel.mutate(image);
    }
  };

  return (
    <YStack p="$4">
      <YStack gap="$4">
        <H5 text={"center"} fontWeight={"bold"}>
          Say cheese!
        </H5>
        <H6 text={"center"}>
          Upload your favorite photo or take a new one right now.
        </H6>
      </YStack>
      <XStack gap={"$4"} p="$4">
        <Button card icon={GalleryHorizontalEnd} onPress={onSelectImage}>
          Choose photo
        </Button>
        <Button card icon={Camera} onPress={onCamera}>
          Take photo
        </Button>
      </XStack>
    </YStack>
  );
};
