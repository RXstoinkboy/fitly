import { Wand2 } from "@tamagui/lucide-icons";
import { Spinner } from "tamagui";
import { Button } from "./button";
import { useGenerateImageMutation } from "@/queries/image-generation/mutation";
import { fileUriToBase64 } from "@/lib/file-uri-to-base64";
import { saveToFileSystem } from "@/lib/save-to-file-system";
import { paths } from "@/constants/paths";
import { useCallback, useContext, useEffect, useState } from "react";
import { GarmentsContext } from "@/context/garment-context";
import { useGetModelsList } from "@/queries/models/get-models-list";

const loadingStates = [
  "Sending images...",
  "Analyzing content...",
  "Generating image...",
  "Hold on...",
  "Almost there...",
];

export const GenerateImageButton = () => {
  const { bottom, top } = useContext(GarmentsContext);
  const [loadingState, setLoadingState] = useState<string | null>(null);
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

  const updateLoadingState = useCallback((index: number) => {
    setTimeout(() => {
      setLoadingState(loadingStates[index]);
      if (index < loadingStates.length - 1) {
        updateLoadingState(index + 1);
      }
    }, 1500);
  }, []);

  useEffect(() => {
    if (isPending) {
      setLoadingState(
        loadingStates[Math.floor(Math.random() * loadingStates.length)],
      );
    } else {
      setLoadingState(null);
    }
  }, [isPending]);

  const handleGenerate = async () => {
    updateLoadingState(0);
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
      flex={1}
      primary
      icon={isPending ? Spinner : Wand2}
      onPress={handleGenerate}
      elevation={"$2"}
    >
      {isPending
        ? loadingStates[Math.floor(Math.random() * loadingStates.length)]
        : "Create"}
    </Button>
  );
};
