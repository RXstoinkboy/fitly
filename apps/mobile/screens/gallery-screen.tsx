import React, { useState } from 'react';
import { FlatList, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from '@tamagui/linear-gradient';
import { Image, XStack, YStack, Button, Text } from '@/components/v2/ui';
import { useGetGeneratedImagesList } from '@/queries/image-generation/get-generated-images-list';
import { useGetGarmentsList } from '@/queries/garments/get-garments-list';
import { useRemoveGeneratedImage } from '@/queries/image-generation/remove-generated-image';
import { useRemoveGarment } from '@/queries/garments/remove-garment';
import { GarmentType } from '@/lib/garments/types';
import { ImageDetailModal } from '@/components/gallery/image-detail-modal';

type MainFilter = 'generated' | 'garments';
type GarmentFilter = 'all' | GarmentType;

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const GRID_SPACING = 2;
const TILE_SIZE = (width - GRID_SPACING * (GRID_COLUMNS + 1)) / GRID_COLUMNS;

export const GalleryScreen = () => {
  const [mainFilter, setMainFilter] = useState<MainFilter>('generated');
  const [garmentFilter, setGarmentFilter] = useState<GarmentFilter>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: generatedImages = [] } = useGetGeneratedImagesList();
  const { data: topGarments = [] } = useGetGarmentsList({ type: GarmentType.TOP });
  const { data: bottomGarments = [] } = useGetGarmentsList({ type: GarmentType.BOTTOM });

  const { mutate: removeGenerated } = useRemoveGeneratedImage();
  const { mutate: removeGarment } = useRemoveGarment();

  const garmentImages =
    garmentFilter === 'all'
      ? [...topGarments, ...bottomGarments]
      : garmentFilter === GarmentType.TOP
        ? topGarments
        : bottomGarments;

  const images = mainFilter === 'generated' ? generatedImages : garmentImages;

  const handleRemove = (uri: string) => {
    if (mainFilter === 'generated') {
      removeGenerated(uri);
    } else {
      removeGarment(uri);
    }
  };

  const renderItem = ({ item }: { item: string }) => (
    <Pressable onPress={() => setSelectedImage(item)}>
      <Image
        source={{ uri: item, width: TILE_SIZE, height: TILE_SIZE }}
        width={TILE_SIZE}
        height={TILE_SIZE}
        resizeMode="cover"
      />
    </Pressable>
  );

  return (
    <>
      <LinearGradient
        colors={['$color2', '$color6']}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.8, y: 0.8 }}>
        <SafeAreaView style={{ height: '100%' }}>
          <YStack flex={1}>
            {/* Main filter */}
            <XStack px="$4" pt="$2" gap="$2">
              <Button
                type={mainFilter === 'generated' ? 'primary' : 'ghost'}
                size="$3"
                onPress={() => setMainFilter('generated')}>
                Generated
              </Button>
              <Button
                type={mainFilter === 'garments' ? 'primary' : 'ghost'}
                size="$3"
                onPress={() => setMainFilter('garments')}>
                Garments
              </Button>
            </XStack>

            {/* Garment sub-filter */}
            {mainFilter === 'garments' ? (
              <XStack px="$4" pt="$2" gap="$2">
                <Button
                  type={garmentFilter === 'all' ? 'primary' : 'ghost'}
                  size="$2"
                  onPress={() => setGarmentFilter('all')}>
                  All
                </Button>
                <Button
                  type={garmentFilter === GarmentType.TOP ? 'primary' : 'ghost'}
                  size="$2"
                  onPress={() => setGarmentFilter(GarmentType.TOP)}>
                  Top
                </Button>
                <Button
                  type={garmentFilter === GarmentType.BOTTOM ? 'primary' : 'ghost'}
                  size="$2"
                  onPress={() => setGarmentFilter(GarmentType.BOTTOM)}>
                  Bottom
                </Button>
              </XStack>
            ) : null}

            {/* Image grid */}
            {images.length === 0 ? (
              <YStack flex={1} items="center" justify="center">
                <Text color="$color8">No images yet</Text>
              </YStack>
            ) : (
              <FlatList
                data={images}
                keyExtractor={(item) => item}
                renderItem={renderItem}
                numColumns={GRID_COLUMNS}
                columnWrapperStyle={{ gap: GRID_SPACING }}
                contentContainerStyle={{ gap: GRID_SPACING, padding: GRID_SPACING }}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1, marginTop: 8 }}
              />
            )}
          </YStack>
        </SafeAreaView>
      </LinearGradient>

      <ImageDetailModal
        imageUri={selectedImage}
        isGenerated={mainFilter === 'generated'}
        onClose={() => setSelectedImage(null)}
        onRemove={handleRemove}
      />
    </>
  );
};
