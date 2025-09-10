import * as ImagePicker from "expo-image-picker";
import { Button, YStack } from "@/components/ui";

type AddImageProps = {
  onSuccess: (uri: string) => void;
};

export const AddImage = ({ onSuccess }: AddImageProps) => {
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      onSuccess(result.assets[0].uri);
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
      onSuccess(result.assets[0].uri);
    }
  };

  return (
    <YStack>
      <Button onPress={pickImage} bg={"$accent7"}>
        Choose photo
      </Button>
      <Button onPress={takeImage} bg={"$accent7"}>
        Take photo
      </Button>
    </YStack>
  );
};
