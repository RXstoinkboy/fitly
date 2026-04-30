import { useWindowDimensions } from 'react-native';

export const useImageSize = () => {
  const { width } = useWindowDimensions();
  const imageWidth = width * 0.8;
  const height = imageWidth * (3 / 2); // 3:2 aspect ratio

  return { width: imageWidth, height };
};
