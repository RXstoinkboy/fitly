import React, { useCallback } from 'react';
import { Dimensions, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Image, Text, YStack } from '@/components/v2/ui';
import { useModels } from '@/state';
import type { ModelImage } from '@/state/types';

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const GRID_SPACING = 6;
const TILE_SIZE = (width - GRID_SPACING * (GRID_COLUMNS + 1)) / GRID_COLUMNS;

export const ModelsGalleryScreen = () => {
  const { models, currentModelId } = useModels();

  const handleOpenDetail = useCallback((id: string) => {
    router.push(`/model-detail/${id}`);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ModelImage }) => (
      <Pressable onPress={() => handleOpenDetail(item.id)}>
        <Image
          src={item.filePath}
          width={TILE_SIZE}
          height={TILE_SIZE}
          objectFit="cover"
          borderRadius={10}
          borderWidth={item.id === currentModelId ? 2 : 0}
          borderColor={item.id === currentModelId ? '$accent10' : 'transparent'}
        />
      </Pressable>
    ),
    [currentModelId, handleOpenDetail],
  );

  return (
    <YStack flex={1} bg="$color1">
      {models.length === 0 ? (
        <YStack flex={1} items="center" justify="center" px="$4" gap="$2">
          <Text size="l" weigth="semiBold">
            No models yet
          </Text>
          <Text type="secondary" text="center">
            Add a photo from the Settings tab to start your model gallery.
          </Text>
        </YStack>
      ) : (
        <FlatList
          data={models}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={GRID_COLUMNS}
          columnWrapperStyle={{ gap: GRID_SPACING }}
          contentContainerStyle={{ gap: GRID_SPACING, padding: GRID_SPACING, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        />
      )}
    </YStack>
  );
};
