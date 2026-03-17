import { AddModelPhoto, ImagesCarousel } from '@/components/ui-legacy';
import { YStack, XStack, GenerateImageButton, ScreenWrapper, Button } from '@/components/v2';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SelectGarment, useSelectGarment } from '@/components/garments';
import { SelectGarmentType, SelectPhotoSheet, useSelectPhotoSheet } from '@/components/modals';
import { state, useGeneratedImages, useModels, useOnboarding } from '@/state';
import { useWindowDimensions } from 'react-native';
import React from 'react';
import { H6 } from 'tamagui';

export default function HomeScreen() {
  const { currentModel } = useModels();
  const { images, deleteGeneratedImagePermanently } = useGeneratedImages();
  const { tempImage, onImageSelected, handleAddGarment, selectedGarments, garments } =
    useSelectGarment();

  const selectPhotoSheet = useSelectPhotoSheet();

  const { height: windowHeight } = useWindowDimensions();
  const carouselHeight = windowHeight * 0.5;

  const reset = async () => {
    // Clear AsyncStorage (includes TanStack Query cache and onboarding status)
    await AsyncStorage.clear();

    // Clear all images from FileSystem
    const docDir = FileSystem.documentDirectory!;
    const items = await FileSystem.readDirectoryAsync(docDir);

    for (const item of items) {
      await FileSystem.deleteAsync(`${docDir}${item}`, { idempotent: true });
    }

    state.actions.resetAppData();

    console.log('All dev data cleared!');
  };

  const { resetOnboarding } = useOnboarding();

  return (
    <>
      {/*<Button onPress={debugFn}>Debug</Button>*/}
      {/* <Button onPress={reset}>Reset storage</Button> */}
      {/* <Button onPress={resetOnboarding}>Reset onboarding</Button> */}
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
        onSuccess={onImageSelected}>
        {tempImage ? <SelectGarmentType image={tempImage} onSuccess={handleAddGarment} /> : null}
      </SelectPhotoSheet>
    </>
  );
}
