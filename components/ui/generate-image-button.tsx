import { Sparkles } from "@tamagui/lucide-icons";
import { Spinner } from "tamagui";
import { Button } from "./button";
import { useGenerateImageMutation } from "@/queries/image-generation/mutation";
import { fileUriToBase64 } from "@/lib/file-uri-to-base64";
import { saveToFileSystem } from "@/lib/save-to-file-system";
import { paths } from "@/constants/paths";
import { useContext } from "react";
import { GarmentsContext } from "@/context/garment-context";
import { useGetModelsList } from "@/queries/models/get-models-list";

export const GenerateImageButton = () => {
  const { bottom, top } = useContext(GarmentsContext);
  const models = useGetModelsList();
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
    // Convert URIs to base64 strings
    const [modelImageBase64, garmentTopImageBase64, garmentBottomImageBase64] =
      await Promise.all([
        fileUriToBase64(models.data?.[0]),
        fileUriToBase64(top),
        fileUriToBase64(bottom),
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
      width={"100%"}
      icon={isPending ? Spinner : Sparkles}
      onPress={handleGenerate}
    >
      {isPending ? null : "Generate"}
    </Button>
  );
};
