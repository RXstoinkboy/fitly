import {
  YStack,
  Text,
  Button,
  XStack,
  Image,
  Square,
  NoImagePlaceholder,
  ScreenWrapper,
} from '@/components/v2/ui';
import { SelectPhotoModal, useSelectPhotoModal } from '@/components/modals';
import { useAddGarment } from '@/queries/garments/add-garment';
import { GarmentType } from '@/lib/garments/types';
import { useState } from 'react';
import { useGetGarmentsList } from '@/queries/garments/get-garments-list';
import { Link } from 'expo-router';
import { useGenerateImageMutation } from '@/queries/image-generation/mutation';
import { Trash } from '@tamagui/lucide-icons';
import { useRemoveGarment } from '@/queries/garments/remove-garment';

export default function Onboarding() {
  const { isOpen, toggle } = useSelectPhotoModal();
  const generateImageMutation = useGenerateImageMutation();
  const removeGarment = useRemoveGarment();

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
      placeholder: 'Select a top',
      remove: () => {
        if (top.data?.length) {
          removeGarment.mutate(top.data.at(-1)!);
        }
      },
    },
    {
      type: GarmentType.BOTTOM,
      uri: bottom.data,
      title: 'Bottom',
      placeholder: 'Select a bottom',
      remove: () => {
        if (bottom.data?.length) {
          removeGarment.mutate(bottom.data.at(-1)!);
        }
      },
    },
  ];

  const isAnyImageSelected = images.some((img) => img.uri?.length);

  const onGenerateImage = () => {
    generateImageMutation.mutate({
      top: top.data?.at(-1),
      bottom: bottom.data?.at(-1),
    });
  };

  return (
    <ScreenWrapper>
      <YStack flex={1} items={'center'} gap={'$4'}>
        <Text size="xxl" weigth="semiBold" text={'center'}>
          What you&apos;d like to wear?
        </Text>
        <Text type="secondary" text="center">
          Select garments you want to try on
        </Text>

        <XStack width={'100%'} gap={'$4'} justify={'space-evenly'}>
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
                  <Square
                    rounded={'$7'}
                    position="relative"
                    bg={'green'}
                    aspectRatio={1}
                    overflow="hidden">
                    {image.uri?.length ? (
                      <>
                        <Image
                          source={{ uri: image.uri?.at(-1), width: 300, height: 300 }}
                          width={'100%'}
                          height={'100%'}
                          rounded={'$7'}
                          aspectRatio={1}
                        />
                        <Button
                          onPress={image.remove}
                          position="absolute"
                          t={'$2'}
                          r={'$2'}
                          circular
                          icon={<Trash />}
                        />
                      </>
                    ) : (
                      <NoImagePlaceholder text={image.placeholder} />
                    )}
                  </Square>
                  <Text text={'center'}>{image.title}</Text>
                </YStack>
              </Button>
            );
          })}
        </XStack>
        <Link asChild href={'/onboarding/finish'}>
          <Button type="primary" stretched disabled={!isAnyImageSelected} onPress={onGenerateImage}>
            Try this look!
          </Button>
        </Link>
      </YStack>

      <SelectPhotoModal isOpen={isOpen} toggle={toggle} onSuccess={addGarment.mutate} />
    </ScreenWrapper>
  );
}
