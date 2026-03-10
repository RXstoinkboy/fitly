import { AddModelPhoto, ImagesCarousel } from '@/components/ui-legacy';
import { YStack, XStack, Square, Spinner, GenerateImageButton, Image } from '@/components/v2';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SelectGarment, useSelectGarment } from '@/components/garments';
import { SelectGarmentType, SelectPhotoSheet, useSelectPhotoSheet } from '@/components/modals';
import { useGeneratedImages, useModels } from '@/state';
import { useIsMutating } from '@tanstack/react-query';
import { generatedKeys } from '@/queries/image-generation/keys';
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
      {/*<Button onPress={debugFn}>Debug</Button>*/}
      {/* <Button onPress={reset}>Reset storage</Button> */}
      <YStack flex={1}>
        <>
          {!currentModel ? (
            <AddModelPhoto />
          ) : (
            <YStack flex={1} minW={'100%'}>
              <YStack flex={1} justify="center" items="center">
                {images.length > 0 ? (
                  // <>
                  //   {images.map((image) => (
                  //     <YStack key={image.id} gap="$4" mb="$4">
                  //       <H6 px={'$2'}>Generated image</H6>
                  //       <Image
                  //         src={image.filePath}
                  //         width={300}
                  //         height={400}
                  //         rounded={'$7'}
                  //         aspectRatio={3 / 4}
                  //       />
                  //     </YStack>
                  //   ))}
                  // </>
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
      </YStack>
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
