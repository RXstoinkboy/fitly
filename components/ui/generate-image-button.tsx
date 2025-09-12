import { Sparkles } from "@tamagui/lucide-icons";
import { Spinner } from "tamagui";
import { Button } from "./button";
import {
  BOTTOM_IMAGE_STORAGE_KEY,
  getModelImage,
  MODEL_IMAGE_STORAGE_KEY,
  TOP_IMAGE_STORAGE_KEY,
} from "@/hooks/use-model-image";
import { useGenerateImageMutation } from "@/queries/image-generation/mutation";
import { fileUriToBase64 } from "@/lib/file-uri-to-base64";
import { saveToFileSystem } from "@/lib/save-to-file-system";
import { paths } from "@/constants/paths";

export const GenerateImageButton = () => {
  const { mutate, isPending } = useGenerateImageMutation({
    onSuccess: (data) => {
      if (data) {
        return saveToFileSystem(paths.fileSystem.generated, data);
      }
    },
    onError: (error) => {
      // Handle error
    },
  });

  const handleGenerate = async () => {
    const [modelImage, topImage, bottomImage] = await Promise.all([
      getModelImage(MODEL_IMAGE_STORAGE_KEY)(),
      getModelImage(TOP_IMAGE_STORAGE_KEY)(),
      getModelImage(BOTTOM_IMAGE_STORAGE_KEY)(),
    ]);

    // Convert URIs to base64 strings
    const [modelImageBase64, garmentTopImageBase64, garmentBottomImageBase64] =
      await Promise.all([
        fileUriToBase64(modelImage),
        fileUriToBase64(topImage),
        fileUriToBase64(bottomImage),
      ]);

    mutate({
      modelImageBase64,
      garmentTopImageBase64,
      garmentBottomImageBase64,
    });
  };

  return (
    <Button
      buttonSize="lg"
      rounded={"$radius.12"}
      primary
      icon={isPending ? Spinner : Sparkles}
      onPress={handleGenerate}
    >
      {isPending ? null : "Generate"}
    </Button>
  );
};
