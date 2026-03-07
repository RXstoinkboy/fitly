import React from 'react';
import { Pressable } from 'react-native';
import { Image } from '@/components/v2/ui';
import type { GeneratedImage, GarmentImage } from '@/state/types';

type GalleryTileProps = {
  item: GeneratedImage | GarmentImage;
  tileSize: number;
  onPress: (item: GeneratedImage | GarmentImage) => void;
};

export const GalleryTile = ({ item, tileSize, onPress }: GalleryTileProps) => {
  return (
    <Pressable onPress={() => onPress(item)}>
      <Image src={item.filePath} width={tileSize} height={tileSize} objectFit="cover" />
    </Pressable>
  );
};
