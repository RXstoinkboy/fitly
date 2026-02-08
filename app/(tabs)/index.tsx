import { YStack, XStack, H6, View } from 'tamagui';
import { LinearGradient } from '@tamagui/linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, AddModelPhoto, GenerateImageButton, ImagesCarousel } from '@/components/ui-legacy';
import { useGetModelsList } from '@/queries/models/get-models-list';
import { useState } from 'react';
import { useGetGeneratedImagesList } from '@/queries/image-generation/get-generated-images-list';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SelectGarment, useSelectGarment } from '@/components/garments';
import { SelectGarmentType, SelectPhotoModal } from '@/components/modals';

export default function HomeScreen() {
  const models = useGetModelsList();
  const generatedImages = useGetGeneratedImagesList();
  const {
    tempImage,
    onImageSelected,
    handleAddGarment,
    selectPhotoModal,
    selectedGarments,
    garments,
  } = useSelectGarment();

  const images = [...(models.data ?? []), ...(generatedImages.data ?? [])];
  const [galleryWrapperHeight, setGalleryWrapperHeight] = useState(0);

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

  return (
    <>
      <LinearGradient
        colors={['$color2', '$color6']}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.8, y: 0.8 }}>
        <SafeAreaView height={'100%'} bg="$accent11">
          {/*<Button onPress={debugFn}>Debug</Button>*/}
          <Button onPress={reset}>Reset storage</Button>
          <YStack flex={1}>
            {!models.data?.length ? (
              <AddModelPhoto />
            ) : (
              <YStack flex={1} minW={'100%'}>
                <View
                  flex={1}
                  onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    setGalleryWrapperHeight(height);
                  }}>
                  <ImagesCarousel height={galleryWrapperHeight ?? 0} images={images} />
                </View>
                {models.data?.length ? (
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
        </SafeAreaView>
      </LinearGradient>
      <SelectPhotoModal
        isOpen={selectPhotoModal.isOpen}
        toggle={selectPhotoModal.toggle}
        onSuccess={onImageSelected}>
        {tempImage ? <SelectGarmentType image={tempImage} onSuccess={handleAddGarment} /> : null}
      </SelectPhotoModal>
    </>
  );
}
