import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export const MODEL_IMAGE_STORAGE_KEY = "model-image";

const storeModelImage = (imageUri: string) => {
  return AsyncStorage.setItem(MODEL_IMAGE_STORAGE_KEY, imageUri);
};

const clearModelImage = () => {
  return AsyncStorage.removeItem(MODEL_IMAGE_STORAGE_KEY);
};

const getModelImage = () => {
  return AsyncStorage.getItem(MODEL_IMAGE_STORAGE_KEY);
};

export const useModelImage = () => {
  const [modelImage, setModelImage] = useState<string | null>(null);

  const saveModelImage = async (imageUri: string) => {
    await storeModelImage(imageUri);

    setModelImage(imageUri);
  };

  useEffect(() => {
    const setInitialModelImage = async () => {
      const imageUri = await getModelImage();

      setModelImage(imageUri);
    };

    setInitialModelImage();
  }, []);

  return {
    modelImage,
    saveModelImage,
    storeModelImage,
    clearModelImage,
    getModelImage,
  };
};
