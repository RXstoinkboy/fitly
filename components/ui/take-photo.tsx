import { Camera } from "@tamagui/lucide-icons";
import { Button } from ".";
import { takePhoto } from "@/lib/take-photo";

export const TakePhoto = ({
  onSuccess,
}: {
  onSuccess?: (photo: string) => void;
}) => {
  const onCamera = async () => {
    const image = await takePhoto();

    if (image) {
      onSuccess?.(image);
    }
  };

  return (
    <Button card icon={Camera} onPress={onCamera}>
      Take photo
    </Button>
  );
};
