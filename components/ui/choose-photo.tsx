import { GalleryHorizontalEnd } from "@tamagui/lucide-icons";
import { Button } from "./button";
import { pickImage } from "@/lib/pick-image-from-file-system";

export const ChoosePhoto = ({
  onSuccess,
}: {
  onSuccess?: (image: string) => void;
}) => {
  const onSelectImage = async () => {
    const image = await pickImage();

    if (image) {
      onSuccess?.(image);
    }
  };
  return (
    <Button card icon={GalleryHorizontalEnd} onPress={onSelectImage}>
      Choose photo
    </Button>
  );
};
