import { Sparkles } from "@tamagui/lucide-icons";
import { Button, Spinner, Text, Image } from ".";
import {
  BOTTOM_IMAGE_STORAGE_KEY,
  getModelImage,
  MODEL_IMAGE_STORAGE_KEY,
  TOP_IMAGE_STORAGE_KEY,
} from "@/hooks/use-model-image";
import { useGenerateImageMutation } from "@/features/image-generation/mutation";
import { fileUriToBase64 } from "@/lib/file-uri-to-base64";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";

const getFiles = async () => {
  const files = await FileSystem.readDirectoryAsync(
    FileSystem.documentDirectory ?? "",
  );
  return files;
};

export const GenerateImageButton = () => {
  const { mutate, isPending, data } = useGenerateImageMutation({
    onSuccess: (data) => {
      if (data) {
        AsyncStorage.setItem("generatedImage" + data, data);
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

  const [myFiles, setMyFiles] = useState<string[]>([]);

  useEffect(() => {
    getFiles().then(setMyFiles);
  }, []);

  return (
    <>
      {myFiles
        .filter((file) => file.endsWith(".jpg") || file.endsWith(".png"))
        .map((file) => (
          <Image
            key={file}
            source={{
              uri: FileSystem.documentDirectory + file,
              width: 100,
              height: 200,
            }}
            style={{ width: 100, height: 200 }}
          />
        ))}
      <Text>{typeof data}</Text>
      <Text>{data}</Text>
      <Button
        size={"$6"}
        bg="$accent7"
        icon={isPending ? Spinner : Sparkles}
        onPress={handleGenerate}
      >
        {isPending ? null : "Generate"}
      </Button>
    </>
  );
};
