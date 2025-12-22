import { YStack, Image, XStack, H6, View } from 'tamagui';
import { LinearGradient } from '@tamagui/linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, AddModelPhoto, GenerateImageButton, ImagesCarousel } from '@/components/ui-legacy';
import { Link } from 'expo-router';
import { useGetModelsList } from '@/queries/models/get-models-list';
import { Shirt } from '@tamagui/lucide-icons';
import { useContext, useState } from 'react';
import { GarmentsContext } from '@/context/garment-context';
import { useGetGeneratedImagesList } from '@/queries/image-generation/get-generated-images-list';
import * as FileSystem from 'expo-file-system';
import { paths } from '@/constants/paths';
import { useUpdateStatus } from '@/queries/onboarding/update-status';
import { OnboardingStatus } from '@/lib/onboarding/types';

export default function HomeScreen() {
  const models = useGetModelsList();
  const generatedImages = useGetGeneratedImagesList();
  const { bottom, top } = useContext(GarmentsContext);
  const images = [...(models.data ?? []), ...(generatedImages.data ?? [])];
  const [galleryWrapperHeight, setGalleryWrapperHeight] = useState(0);

  console.log('generatedImages', generatedImages.data);

  const debugFn = async () => {
    console.log('debugFn called', `${FileSystem.documentDirectory}${paths.fileSystem.generated}`);
    const info = await FileSystem.getInfoAsync(
      `${FileSystem.documentDirectory}${paths.fileSystem.generated}`,
    );
    console.log('info', info);
    const dir = await FileSystem.readDirectoryAsync(
      `${FileSystem.documentDirectory}${paths.fileSystem.generated}`,
    );
    console.log('dir', dir);
  };
  const updateStatus = useUpdateStatus();

  const reset = () => {
    updateStatus.mutate(OnboardingStatus.InProgress);
  };
  return (
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
                      <H6 px={'$2'}>Let's try something on</H6>
                      <XStack gap="$2" width={'100%'} justify="center">
                        <Link href="/garments/top" asChild>
                          <Button
                            card="outlined"
                            flex={1}
                            icon={() =>
                              top ? (
                                <Image source={{ uri: top, height: 80, width: 80 }} />
                              ) : (
                                <Shirt />
                              )
                            }>
                            Top
                          </Button>
                        </Link>
                        <Link href="/garments/bottom" asChild>
                          <Button
                            card="outlined"
                            flex={1}
                            icon={() =>
                              bottom ? (
                                <Image source={{ uri: bottom, height: 80, width: 80 }} />
                              ) : null
                            }>
                            Bottom
                          </Button>
                        </Link>
                      </XStack>
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
  );
}
