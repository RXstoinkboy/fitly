import { YStack, Text, Button, XStack, Image, Square } from '@/components/v2/ui';
import { SelectPhotoModal, useSelectPhotoModal } from '@/components/modals';
import { useAddGarment } from '@/queries/garments/add-garment';
import { GarmentType } from '@/lib/garments/types';
import { useState } from 'react';
import { useGetGarmentsList } from '@/queries/garments/get-garments-list';

export default function Onboarding() {
  const { isOpen, toggle } = useSelectPhotoModal();
  const [garmentType, setGarmentType] = useState<GarmentType>(GarmentType.TOP);
  const addGarment = useAddGarment({
    type: garmentType,
    options: {
      onSuccess: () => {
        toggle(false);
      },
    },
  });
  const top = useGetGarmentsList({
    type: GarmentType.TOP,
  });
  const bottom = useGetGarmentsList({
    type: GarmentType.BOTTOM,
  });

  const images = [
    {
      type: GarmentType.TOP,
      uri: top.data,
      title: 'Top',
    },
    {
      type: GarmentType.BOTTOM,
      uri: bottom.data,
      title: 'Bottom',
    },
  ];

  return (
    <>
      <YStack flex={1} items={'center'} gap={'$4'}>
        <Text size="xxl" weigth="semiBold" text={'center'}>
          {'Congratulations! \nYour picture is ready'}
        </Text>
        <Text type="secondary" text="center">
          Now, select first garments to try
        </Text>
        <XStack
          borderWidth={1}
          borderColor={'red'}
          width={'100%'}
          gap={'$4'}
          justify={'space-evenly'}>
          {images.map((image) => {
            return (
              <Button
                asChild
                key={image.type}
                flex={1}
                onPress={() => {
                  setGarmentType(image.type);
                  toggle();
                }}>
                <YStack gap={'$2'}>
                  <Square rounded={'$7'} position="relative" bg={'green'} aspectRatio={1}>
                    <Image
                      source={{ uri: image.uri?.at(-1), width: 300, height: 300 }}
                      width={'100%'}
                      height={'100%'}
                      rounded={'$7'}
                      aspectRatio={1}
                    />
                  </Square>
                  <Text text={'center'}>{image.title}</Text>
                </YStack>
              </Button>
            );
          })}
          {/* <YStack borderWidth={1} borderColor={'yellow'} flex={1}>
            <Image
              source={{ uri: bottom.data?.at(-1), width: 300, height: 300 }}
              rounded={'$7'}
              aspectRatio={1}
            />
            <Button
              type="primary"
              flex={1}
              onPress={() => {
                setGarmentType(GarmentType.BOTTOM);
                toggle();
              }}>
              Bottom
            </Button>
          </YStack> */}
        </XStack>
      </YStack>

      <SelectPhotoModal isOpen={isOpen} toggle={toggle} onSuccess={addGarment.mutate} />
    </>
  );
}
