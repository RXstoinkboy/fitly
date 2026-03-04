import * as React from 'react';
import { Image, View } from 'tamagui';
import type { TAnimationStyle } from 'react-native-reanimated-carousel';
import Carousel from 'react-native-reanimated-carousel';
import Animated, {
  useSharedValue,
  interpolate,
  Extrapolation,
  FadeInDown,
} from 'react-native-reanimated';
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
        <Image
          source={{ uri: image.filePath, width: 300, height: 400 }}
          width={'100%'}
          height={'100%'}
          rounded={'$7'}
        />
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
  const PAGE_WIDTH = height * 0.75 || width;
  const PAGE_HEIGHT = height;

  const router = useRouter();

  const directionAnimVal = useSharedValue(0);

  const { garments: topGarments } = useTopGarments();
  const { garments: bottomGarments } = useBottomGarments();
  const allGarments = [...topGarments, ...bottomGarments];

  const animationStyle: TAnimationStyle = React.useCallback(
    (value: number) => {
      'worklet';
      const translateY = interpolate(value, [0, 1], [0, -33]);
      const translateX = interpolate(value, [-1, 0], [-PAGE_WIDTH, 0], Extrapolation.CLAMP);
      const rotateZ = interpolate(value, [-1, 0], [-15, 0], Extrapolation.CLAMP);

      const zIndex = Math.round(
        interpolate(
          value,
          [0, 1, 2, 3, 4],
          [0, 1, 2, 3, 4].map((v) => (images.length - v) * 10),
          Extrapolation.CLAMP,
        ),
      );

      const scale = interpolate(value, [0, 1], [1, 0.92]);
      const opacity = interpolate(value, [-1, -0.8, 0, 1], [0, 0.9, 1, 0.85], Extrapolation.EXTEND);

      return {
        transform: [{ translateY }, { translateX }, { rotateZ: `${rotateZ}deg` }, { scale }],
        zIndex,
        opacity,
      };
    },
    [images.length, PAGE_WIDTH],
  );

  return (
    <View style={{ flex: 1 }}>
      <Carousel
        loop={true}
        style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        defaultIndex={0}
        vertical={false}
        width={PAGE_WIDTH}
        height={PAGE_HEIGHT}
        data={images}
        onConfigurePanGesture={(g) => {
          g.onChange((e) => {
            'worklet';
            directionAnimVal.value = Math.sign(e.translationX);
          });
        }}
        renderItem={({ index, item }) => (
          <SlideItem
            key={index}
            image={item}
            garments={allGarments}
            onRemove={() => onRemove(item.id)}
            onPress={() =>
              router.push({ pathname: '/image-viewer', params: { uri: item.filePath } })
            }
          />
        )}
        customAnimation={animationStyle}
        windowSize={5}
      />
    </View>
  );
}
