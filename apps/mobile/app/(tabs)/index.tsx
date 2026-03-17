import { AddModelPhoto, ImagesCarousel } from '@/components/ui-legacy';
import { YStack, XStack, GenerateImageButton, ScreenWrapper } from '@/components/v2';
import { SelectGarment, useSelectGarment } from '@/components/garments';
import { SelectGarmentType, SelectPhotoSheet, useSelectPhotoSheet } from '@/components/modals';
import { useGeneratedImages, useModels } from '@/state';
import { useWindowDimensions } from 'react-native';
import React from 'react';
import { H6 } from 'tamagui';

export default function HomeScreen() {
  const { currentModel } = useModels();
  const { images, deleteGeneratedImagePermanently } = useGeneratedImages();
  const { tempImage, onImageSelected, handleAddGarment, selectedGarments, garments } =
    useSelectGarment('app');

  const selectPhotoSheet = useSelectPhotoSheet();

  const { height: windowHeight } = useWindowDimensions();
  const carouselHeight = windowHeight * 0.5;

  return (
    <>
      <ScreenWrapper>
        <>
          {!currentModel ? (
            <AddModelPhoto />
          ) : (
            <YStack flex={1} minW={'100%'}>
              <YStack flex={1} justify="center" items="center">
                {images.length > 0 ? (
                  <ImagesCarousel
                    height={carouselHeight}
                    images={images}
                    onRemove={deleteGeneratedImagePermanently}
                  />
                ) : null}
              </YStack>
              {currentModel ? (
                <YStack gap="$4" px="$6">
                  <YStack gap={'$4'}>
                    <YStack gap={'$2'}>
                      <H6 px={'$2'}>Let&apos;s try something on</H6>
                      <SelectGarment
                        removeGarment={garments.removeGarment}
                        selectedGarments={selectedGarments.selectedGarments}
                        toggle={selectPhotoSheet.toggle}
                        toggleSelection={selectedGarments.toggleSelection}
                      />
                    </YStack>
                    <XStack justify={'space-evenly'} gap={'$4'}>
                      <GenerateImageButton />
                    </XStack>
                  </YStack>
                </YStack>
              ) : null}
            </YStack>
          )}
        </>
      </ScreenWrapper>
      <SelectPhotoSheet
        isOpen={selectPhotoSheet.isOpen}
        toggle={selectPhotoSheet.toggle}
        onSuccess={onImageSelected}
        subject="garment"
        flow="app">
        {tempImage ? <SelectGarmentType image={tempImage} onSuccess={handleAddGarment} /> : null}
      </SelectPhotoSheet>
    </>
  );
}
