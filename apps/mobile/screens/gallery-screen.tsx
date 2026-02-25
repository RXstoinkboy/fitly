import React, { useState } from 'react';
import { FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from '@tamagui/linear-gradient';
import { YStack, Tabs, Text } from '@/components/v2/ui';
import { useGeneratedImages, useTopGarments, useBottomGarments } from '@/state';
import { GalleryTile } from '@/components/gallery/gallery-tile';
import { GalleryFilter } from '@/components/gallery/gallery-filter';
import { router } from 'expo-router';
import type { GeneratedImage, GarmentImage } from '@/state/types';
import type { GarmentFilter, ImageDetailType } from '@/components/gallery/types';

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const GRID_SPACING = 2;
const TILE_SIZE = (width - GRID_SPACING * (GRID_COLUMNS + 1)) / GRID_COLUMNS;

const getFilteredGarments = (
  filter: GarmentFilter,
  topGarments: GarmentImage[],
  bottomGarments: GarmentImage[],
): GarmentImage[] => {
  const filterMap: Record<GarmentFilter, GarmentImage[]> = {
    all: [...topGarments, ...bottomGarments],
    top: topGarments,
    bottom: bottomGarments,
  };
  return filterMap[filter] ?? filterMap.all;
};

export const GalleryScreen = () => {
  const [garmentFilter, setGarmentFilter] = useState<GarmentFilter>('all');

  const { images: generatedImages } = useGeneratedImages();
  const { garments: topGarments } = useTopGarments();
  const { garments: bottomGarments } = useBottomGarments();

  const garmentImages = getFilteredGarments(garmentFilter, topGarments, bottomGarments);

  const handlePress = (item: GeneratedImage | GarmentImage, type: ImageDetailType) => {
    router.push(`/image-detail/${item.id}?type=${type}`);
  };

  const renderGeneratedItem = ({ item }: { item: GeneratedImage }) => (
    <GalleryTile item={item} tileSize={TILE_SIZE} onPress={() => handlePress(item, 'generated')} />
  );

  const renderGarmentItem = ({ item }: { item: GarmentImage }) => (
    <GalleryTile item={item} tileSize={TILE_SIZE} onPress={() => handlePress(item, item.type)} />
  );

  return (
    <LinearGradient
      colors={['$color2', '$color6']}
      start={{ x: 0.2, y: 0.1 }}
      end={{ x: 0.8, y: 0.8 }}>
      <SafeAreaView style={{ height: '100%' }}>
        <Tabs defaultValue="generated" flexDirection="column" flex={1}>
          <Tabs.List>
            <Tabs.Tab flex={1} value="generated">
              <Text>Generated</Text>
            </Tabs.Tab>
            <Tabs.Tab flex={1} value="garments">
              <Text>Garments</Text>
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Content value="generated" flex={1}>
            {generatedImages.length === 0 ? (
              <YStack flex={1} items="center" justify="center">
                <Text color="$color8">No generated images yet</Text>
              </YStack>
            ) : (
              <FlatList
                data={generatedImages}
                keyExtractor={(item) => item.id}
                renderItem={renderGeneratedItem}
                numColumns={GRID_COLUMNS}
                columnWrapperStyle={{ gap: GRID_SPACING }}
                contentContainerStyle={{ gap: GRID_SPACING, padding: GRID_SPACING }}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
              />
            )}
          </Tabs.Content>

          <Tabs.Content value="garments" flex={1}>
            <YStack flex={1} position="relative">
              {garmentImages.length === 0 ? (
                <YStack flex={1} items="center" justify="center">
                  <Text color="$color8">No garments yet</Text>
                </YStack>
              ) : (
                <FlatList
                  data={garmentImages}
                  keyExtractor={(item) => item.id}
                  renderItem={renderGarmentItem}
                  numColumns={GRID_COLUMNS}
                  columnWrapperStyle={{ gap: GRID_SPACING }}
                  contentContainerStyle={{ gap: GRID_SPACING, padding: GRID_SPACING, paddingBottom: 80 }}
                  showsVerticalScrollIndicator={false}
                  style={{ flex: 1 }}
                />
              )}
              <GalleryFilter filter={garmentFilter} onChange={setGarmentFilter} />
            </YStack>
          </Tabs.Content>
        </Tabs>
      </SafeAreaView>
    </LinearGradient>
  );
};

