import * as React from 'react';
import { Image, View } from '@/components/v2/ui';
import Carousel, { type ICarouselInstance } from 'react-native-reanimated-carousel';
import Animated, { useSharedValue, FadeInDown } from 'react-native-reanimated';
import { Dimensions } from 'react-native';
import { GeneratedImage, GarmentImage } from '@/state/types';
import { useTopGarments, useBottomGarments, useDressGarments, useOuterwearGarments } from '@/state';
import { useRouter } from 'expo-router';
import { GeneratedImageCard } from './generated-image-card';
import { analyticsEvents, trackEvent } from '@/lib/analytics';
import { ImageLoader } from './image-loader';

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
const PLACEHOLDER_ID = '__generating_placeholder__';

export function ImagesCarousel({
  height,
  images,
  onRemove,
  isGenerating = false,
}: {
  height: number;
  images: GeneratedImage[];
  onRemove: (id: string) => void;
  isGenerating?: boolean;
}) {
  const { width } = Dimensions.get('window');

  const router = useRouter();

  const carouselRef = React.useRef<ICarouselInstance>(null);
  const directionAnimVal = useSharedValue(0);
  const currentIndex = React.useRef(0);
  const prevImagesLength = React.useRef(images.length);

  const { garments: topGarments } = useTopGarments();
  const { garments: bottomGarments } = useBottomGarments();
  const { garments: dressGarments } = useDressGarments();
  const { garments: outerwearGarments } = useOuterwearGarments();
  const allGarments = [...topGarments, ...bottomGarments, ...dressGarments, ...outerwearGarments];

  const displayImages = React.useMemo(() => {
    if (isGenerating) {
      return [...images, { id: PLACEHOLDER_ID } as GeneratedImage];
    }
    return images;
  }, [images, isGenerating]);

  const prevGenerating = React.useRef(isGenerating);

  React.useEffect(() => {
    if (isGenerating && !prevGenerating.current) {
      setTimeout(() => {
        carouselRef.current?.scrollTo({
          index: displayImages.length - 1,
          animated: true,
        });
      }, 100);
    }
    if (!isGenerating && prevGenerating.current) {
      setTimeout(() => {
        carouselRef.current?.scrollTo({
          index: displayImages.length - 1,
          animated: false,
        });
      }, 50);
    }
    prevGenerating.current = isGenerating;
  }, [isGenerating, displayImages.length]);

  React.useEffect(() => {
    if (images.length < prevImagesLength.current) {
      const newIndex = Math.max(0, currentIndex.current - 1);
      currentIndex.current = newIndex;
      carouselRef.current?.scrollTo({ index: newIndex, animated: true });
    }
    prevImagesLength.current = images.length;
  }, [images.length]);

  return (
    <View style={{ flex: 1 }}>
      <Carousel
        ref={carouselRef}
        style={{
          width,
          height,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        loop={false}
        defaultIndex={displayImages.length - 1}
        vertical={false}
        width={width}
        height={height}
        data={displayImages}
        renderItem={({ index, item }) => {
          if (isGenerating) {
            return (
              <Animated.View
                entering={FadeInDown.duration(1000)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <ImageLoader wrapped={true} width={0.9 * width} height={height} />
              </Animated.View>
            );
          }
          return (
            <SlideItem
              key={index}
              image={item}
              garments={allGarments}
              onRemove={() => onRemove(item.id)}
              onPress={() => {
                trackEvent(analyticsEvents.gallery.openedItem('generated'), {
                  itemId: item.id,
                  type: 'generated',
                  source: 'main_carousel',
                });
                router.push({
                  pathname: '/image-detail/[id]',
                  params: { id: item.id, type: 'generated' },
                });
              }}
            />
          );
        }}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 65,
        }}
        onProgressChange={(_offsetProgress, absoluteProgress) => {
          directionAnimVal.value = absoluteProgress;
        }}
        onSnapToItem={(index) => {
          currentIndex.current = index;
        }}
      />
    </View>
  );
}
