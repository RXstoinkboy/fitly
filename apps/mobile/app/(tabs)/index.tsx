import { useMount } from '@/hooks';
import { YStack, XStack, H6, ScrollView, Square, Spinner } from 'tamagui';
import { LinearGradient } from '@tamagui/linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, AddModelPhoto, GenerateImageButton } from '@/components/ui-legacy';
import { Image } from '@/components/v2/ui';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SelectGarment, useSelectGarment } from '@/components/garments';
import { SelectGarmentType, SelectPhotoSheet } from '@/components/modals';
import { useGeneratedImages, useModels } from '@/state';
import { useIsMutating } from '@tanstack/react-query';
import { generatedKeys } from '@/queries/image-generation/keys';
import { useEffect, useRef } from 'react';

export default function HomeScreen() {
  const { currentModel } = useModels();
  const { images } = useGeneratedImages();
  const {
    tempImage,
    onImageSelected,
    handleAddGarment,
    selectPhotoSheet,
    selectedGarments,
    garments,
  } = useSelectGarment();

  // const [galleryWrapperHeight, setGalleryWrapperHeight] = useState(0);

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

  const ref = useRef<ScrollView>(null);

  const scroll = () => {
    if (ref.current) {
      ref.current.scrollToEnd({ animated: true }); // Adjust the scroll amount as needed
    }
  };

  useEffect(() => {
    if (isGenerating) {
      scroll();
    }
  }, [isGenerating]);

  useMount(() => {
    scroll();
  });

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
            {!currentModel ? (
              <AddModelPhoto />
            ) : (
              <YStack flex={1} minW={'100%'}>
                <ScrollView ref={ref} horizontal showsHorizontalScrollIndicator>
                  <XStack minW={'100%'} gap={'$4'} paddingInline={'$4'} justify={'flex-end'}>
                    {/* onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    setGalleryWrapperHeight(height);
                  }}> */}
                    {images.map((image) => (
                      <Image
                        key={image.id}
                        source={{ uri: image.filePath, width: 300, height: 400 }}
                        rounded={'$7'}
                        aspectRatio={3 / 4}
                      />
                    ))}
                    {isGenerating ? (
                      <Square width={300} height={400} rounded={'$7'} bg={'$color6'}>
                        <Spinner size="large" />
                      </Square>
                    ) : null}

                    {/* <ImagesCarousel height={galleryWrapperHeight ?? 0} images={images} /> */}
                  </XStack>
                </ScrollView>
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
          </YStack>
        </SafeAreaView>
      </LinearGradient>
      <SelectPhotoSheet
        isOpen={selectPhotoSheet.isOpen}
        toggle={selectPhotoSheet.toggle}
        onSuccess={onImageSelected}>
        {tempImage ? <SelectGarmentType image={tempImage} onSuccess={handleAddGarment} /> : null}
      </SelectPhotoSheet>
    </>
  );
}
