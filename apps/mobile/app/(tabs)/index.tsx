import { useMount } from '@/hooks';
import { AddModelPhoto } from '@/components/ui-legacy';
import {
  YStack,
  XStack,
  Text,
  ScrollView,
  Square,
  Spinner,
  Image,
  GenerateImageButton,
} from '@/components/v2';
import * as FileSystem from 'expo-file-system/legacy';
import { ImagesCarousel } from '@/components/ui-legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SelectGarment, useSelectGarment } from '@/components/garments';
import { SelectGarmentType, SelectPhotoSheet } from '@/components/modals';
import { useGeneratedImages, useModels } from '@/state';
import { useIsMutating } from '@tanstack/react-query';
import { generatedKeys } from '@/queries/image-generation/keys';
import { useWindowDimensions } from 'react-native';
import React from 'react';
import { LinearGradient } from 'react-native-svg';
import { H6 } from 'tamagui';

export default function HomeScreen() {
  const { currentModel } = useModels();
  const { images, deleteGeneratedImagePermanently } = useGeneratedImages();
  const {
    tempImage,
    onImageSelected,
    handleAddGarment,
    selectPhotoSheet,
    selectedGarments,
    garments,
  } = useSelectGarment();

  const { height: windowHeight } = useWindowDimensions();
  const carouselHeight = windowHeight * 0.55;

  const reset = async () => {
    // Clear AsyncStorage (includes TanStack Query cache and onboarding status)
    await AsyncStorage.clear();

    // Clear all images from FileSystem
    const docDir = FileSystem.documentDirectory!;
    const items = await FileSystem.readDirectoryAsync(docDir);

    for (const item of items) {
      await FileSystem.deleteAsync(`${docDir}${item}`, { idempotent: true });
    }

    console.log('All dev data cleared!');
  };

  const isGenerating = useIsMutating({
    mutationKey: generatedKeys.add(),
  });

  return (
    <>
      <LinearGradient
        colors={['$color2', '$color6']}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.8, y: 0.8 }}>
          {/*<Button onPress={debugFn}>Debug</Button>*/}
          {/* <Button onPress={reset}>Reset storage</Button> */}
          <YStack flex={1}>
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
                  {isGenerating ? (
                    <Square width={300} height={400} rounded={'$7'} bg={'$color6'}>
                      <Spinner size="large" />
                    </Square>
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
                          toggle={selectPhotoModal.toggle}
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
          </YStack>
      </LinearGradient>
      <SelectPhotoModal
        isOpen={selectPhotoModal.isOpen}
        toggle={selectPhotoModal.toggle}
        onSuccess={onImageSelected}>
        {tempImage ? <SelectGarmentType image={tempImage} onSuccess={handleAddGarment} /> : null}
      </SelectPhotoSheet>
    </>
  );
}
