import { Button } from "@/components/ui";
import { XStack } from "tamagui";
import { GalleryHorizontalEnd, Camera } from "@tamagui/lucide-icons";
import { pickImage } from "@/lib/pick-image-from-file-system";
import { takePhoto } from "@/lib/take-photo";

type AddImageProps = {
  onSuccess: (uri: string) => void;
};

export const AddImage = ({ onSuccess }: AddImageProps) => {
  const onSelectImage = async () => {
    const image = await pickImage();
  };

  const onCamera = async () => {
    const image = await takePhoto();
  };

  return (
    <XStack gap={"$4"} p="$4">
      <Button card icon={GalleryHorizontalEnd} onPress={onSelectImage}>
        Choose photo
      </Button>
      <Button card icon={Camera} onPress={onCamera}>
        Take photo
      </Button>
    </XStack>
  );
};
