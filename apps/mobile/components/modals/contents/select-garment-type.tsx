import { type ImageSource, GarmentType } from '@/state';
import { memo } from 'react';
import { YStack, Button, Text, XStack } from '@/components/v2/ui';
import { Shirt, Skirt, Jacket, Dress } from '@/icons';

export const SelectGarmentType = memo(
  ({
    image,
    onSuccess,
    selectedGarments,
  }: {
    image: { filePath: string; source: ImageSource };
    onSuccess: (filePath: string, source: ImageSource, type: GarmentType) => Promise<void>;
    selectedGarments: GarmentType[];
  }) => {
    const onTop = () => {
      onSuccess(image.filePath, image.source, GarmentType.TOP);
    };
    const onBottom = () => {
      onSuccess(image.filePath, image.source, GarmentType.BOTTOM);
    };
    const onDress = () => {
      onSuccess(image.filePath, image.source, GarmentType.DRESS);
    };
    const onOuterwear = () => {
      onSuccess(image.filePath, image.source, GarmentType.OUTERWEAR);
    };

    const isDisabled = (type: GarmentType) => selectedGarments.includes(type);

    return (
      <YStack width={'100%'} gap={'$2'}>
        <Text>Pick a garment type</Text>
        <XStack gap="$2">
          <Button
            onPress={onTop}
            flexDirection="column"
            flex={1}
            height={'auto'}
            p={'$4'}
            disabled={isDisabled(GarmentType.TOP)}>
            <Shirt />
            Top
          </Button>
          <Button
            onPress={onBottom}
            flexDirection="column"
            flex={1}
            height={'auto'}
            p={'$4'}
            disabled={isDisabled(GarmentType.BOTTOM)}>
            <Skirt color={'$color'} height={'$2'} width={'$2'} />
            Bottom
          </Button>
        </XStack>
        <XStack gap="$2">
          <Button
            onPress={onDress}
            flexDirection="column"
            flex={1}
            height={'auto'}
            p={'$4'}
            disabled={isDisabled(GarmentType.DRESS)}>
            <Dress color={'$color'} height={'$2'} width={'$2'} />
            Dress
          </Button>
          <Button
            onPress={onOuterwear}
            flexDirection="column"
            flex={1}
            height={'auto'}
            p={'$4'}
            disabled={isDisabled(GarmentType.OUTERWEAR)}>
            <Jacket color={'$color'} height={'$2'} width={'$2'} />
            Outerwear
          </Button>
        </XStack>
      </YStack>
    );
  },
);
SelectGarmentType.displayName = 'SelectGarmentType';
