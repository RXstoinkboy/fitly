import React from 'react';
import { Pressable } from 'react-native';
import { Image, View } from '@/components/v2/ui';
import type { GeneratedImage, GarmentImage } from '@/state/types';

type GalleryTileProps = {
  item: GeneratedImage | GarmentImage;
  tileSize: number;
  onPress: (item: GeneratedImage | GarmentImage) => void;
};

export const GalleryTile = ({ item, tileSize, onPress }: GalleryTileProps) => {
  return (
    <Pressable onPress={() => onPress(item)}>
      <View overflow="hidden" rounded={'$3'}>
        <Image src={item.filePath} width={tileSize} height={tileSize} objectFit="cover" />
      </View>
    </Pressable>
  );
};
