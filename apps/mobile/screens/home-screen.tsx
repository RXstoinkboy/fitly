import { AddModelPhoto, ImagesCarousel } from '@/components/ui-legacy';
import { YStack, XStack, GenerateImageButton, ScreenWrapper, Text } from '@/components/v2';
import { SelectGarment, useSelectGarment } from '@/components/v2/domain';
import { SelectGarmentType, SelectPhotoSheet } from '@/components/modals';
import { useGeneratedImages, useModels } from '@/state';
import { useWindowDimensions } from 'react-native';
import React from 'react';

export const HomeScreen = () => {
  const { currentModel } = useModels();
  const { images, deleteGeneratedImagePermanently } = useGeneratedImages();
  const {
    tempImage,
    onImageSelected,
    handleAddGarment,
    selectPhotoSheet,
    selectedGarments,
    garments,
  } = useSelectGarment('app');

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
                      <Text fontFamily={'$heading'} size="xl" px={'$2'}>
                        Let&apos;s try something on
                      </Text>
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
};
