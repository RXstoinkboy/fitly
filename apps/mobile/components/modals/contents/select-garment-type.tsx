import { GarmentType } from '@/lib/garments/types';
import type { ImageSource } from '@/state';
import { memo } from 'react';
import { YStack, Button, Text } from '@/components/v2/ui';

export const SelectGarmentType = memo(
  ({
    image,
    onSuccess,
  }: {
    image: { filePath: string; source: ImageSource };
    onSuccess: (filePath: string, source: ImageSource, type: GarmentType) => Promise<void>;
  }) => {
    const onTop = () => {
      onSuccess(image.filePath, image.source, GarmentType.TOP);
    };
    const onBottom = () => {
      onSuccess(image.filePath, image.source, GarmentType.BOTTOM);
    };

    return (
      <YStack width={'100%'} gap={'$2'}>
        <Text>Pick a garment type</Text>
        <Button onPress={onTop}>Top</Button>
        <Button onPress={onBottom}>Bottom</Button>
      </YStack>
    );
  },
);
SelectGarmentType.displayName = 'SelectGarmentType';
