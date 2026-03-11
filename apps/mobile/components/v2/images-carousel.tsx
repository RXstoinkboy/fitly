import * as React from 'react';
import { Image, View } from '@/components/v2/ui';
import Carousel from 'react-native-reanimated-carousel';
import Animated, { useSharedValue, FadeInDown } from 'react-native-reanimated';
import { Dimensions } from 'react-native';
import { GeneratedImage, GarmentImage } from '@/state/types';
import { useTopGarments, useBottomGarments } from '@/state';
import { useRouter } from 'expo-router';
import { GeneratedImageCard } from './generated-image-card';

// ---------------------------------------------------------------------------
// Individual slide
// ---------------------------------------------------------------------------
type SlideItemProps = {
  image: GeneratedImage;
  garments: GarmentImage[];
  onRemove: () => void;
  onPress: () => void;
};

const SlideItem = ({ image, garments, onRemove, onPress }: SlideItemProps) => {
  const imageGarments = garments.filter((g) => image.garmentIds.includes(g.id));

  return (
    <Animated.View
      entering={FadeInDown.duration(1000)}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <GeneratedImageCard
        imageUri={image.filePath}
        garments={imageGarments}
        onRemove={onRemove}
        onPress={onPress}>
        <Image src={image.filePath} width={'100%'} height={'100%'} rounded={'$7'} />
      </GeneratedImageCard>
    </Animated.View>
  );
};

// ---------------------------------------------------------------------------
// Carousel
// ---------------------------------------------------------------------------
export function ImagesCarousel({
  height,
  images,
  onRemove,
}: {
  height: number;
  images: GeneratedImage[];
  onRemove: (id: string) => void;
}) {
  const { width } = Dimensions.get('window');
  const PAGE_WIDTH = width;
  const PAGE_HEIGHT = height;

  const router = useRouter();

  const directionAnimVal = useSharedValue(0);

  const { garments: topGarments } = useTopGarments();
  const { garments: bottomGarments } = useBottomGarments();
  const allGarments = [...topGarments, ...bottomGarments];

  return (
    <View style={{ flex: 1 }}>
      <Carousel
        style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        loop={false}
        defaultIndex={images.length - 1}
        vertical={false}
        width={PAGE_WIDTH}
        height={PAGE_HEIGHT}
        data={images}
        renderItem={({ index, item }) => (
          <SlideItem
            key={index}
            image={item}
            garments={allGarments}
            onRemove={() => onRemove(item.id)}
            onPress={() =>
              router.push({
                pathname: '/image-detail/[id]',
                params: { id: item.id, type: 'generated' },
              })
            }
          />
        )}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 65,
        }}
        onProgressChange={(_offsetProgress, absoluteProgress) => {
          directionAnimVal.value = absoluteProgress;
        }}
      />
    </View>
  );
}
