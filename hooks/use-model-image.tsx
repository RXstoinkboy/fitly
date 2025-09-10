import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export const MODEL_IMAGE_STORAGE_KEY = "model-image";
export const TOP_IMAGE_STORAGE_KEY = "top-image";
export const BOTTOM_IMAGE_STORAGE_KEY = "bottom-image";

const storeModelImage = (key: string) => (imageUri: string) => {
  return AsyncStorage.setItem(key, imageUri);
};

const clearModelImage = (key: string) => () => {
  return AsyncStorage.removeItem(key);
};

export const getModelImage = (key: string) => () => {
  return AsyncStorage.getItem(key);
};

export const useModelImage = (key: string) => {
  const [modelImage, setModelImage] = useState<string | null>(null);

  const saveModelImage = async (imageUri: string) => {
    await storeModelImage(key)(imageUri);

    setModelImage(imageUri);
  };

  useEffect(() => {
    const setInitialModelImage = async () => {
      const imageUri = await getModelImage(key)();

      setModelImage(imageUri);
    };

    setInitialModelImage();
  }, [key]);

  return {
    modelImage,
    saveModelImage,
    storeModelImage: storeModelImage(key),
    clearModelImage: clearModelImage(key),
    getModelImage: getModelImage(key),
  };
};
