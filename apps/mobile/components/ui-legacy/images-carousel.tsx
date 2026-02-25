import * as React from 'react';
import { Image, View, XStack } from 'tamagui';
import type { TAnimationStyle } from 'react-native-reanimated-carousel';
import Carousel from 'react-native-reanimated-carousel';
import Animated, {
  useSharedValue,
  interpolate,
  Extrapolation,
  FadeInDown,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  Dimensions,
  Image as RNImage,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Share2, Trash2, X } from '@tamagui/lucide-icons';
import { Button } from './button';
import { GeneratedImage, GarmentImage } from '@/state/types';
import { useTopGarments, useBottomGarments } from '@/state';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Full-screen modal with pinch-to-zoom
// ---------------------------------------------------------------------------
type FullScreenImageModalProps = {
  uri: string;
  visible: boolean;
  onClose: () => void;
};

const FullScreenImageModal = ({ uri, visible, onClose }: FullScreenImageModalProps) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const savedOffsetX = useSharedValue(0);
  const savedOffsetY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, savedScale.value * e.scale);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        offsetX.value = savedOffsetX.value + e.translationX;
        offsetY.value = savedOffsetY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedOffsetX.value = offsetX.value;
      savedOffsetY.value = offsetY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        offsetX.value = withSpring(0);
        offsetY.value = withSpring(0);
        savedOffsetX.value = 0;
        savedOffsetY.value = 0;
      } else {
        scale.value = withSpring(2.5);
        savedScale.value = 2.5;
      }
    });

  const composedGesture = Gesture.Simultaneous(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: offsetX.value },
      { translateY: offsetY.value },
    ],
  }));

  // Reset zoom state when modal closes
  React.useEffect(() => {
    if (!visible) {
      scale.value = 1;
      savedScale.value = 1;
      offsetX.value = 0;
      offsetY.value = 0;
      savedOffsetX.value = 0;
      savedOffsetY.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View flex={1} bg="rgba(0,0,0,0.95)" justify="center" items="center">
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.fullScreenImageContainer, animatedStyle]}>
            <RNImage source={{ uri }} style={styles.fullScreenImage} resizeMode="contain" />
          </Animated.View>
        </GestureDetector>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X color="white" size={24} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Individual slide with garment previews, remove and share buttons
// ---------------------------------------------------------------------------
type SlideItemProps = {
  image: GeneratedImage;
  garments: GarmentImage[];
  onRemove: () => void;
  onPress: () => void;
};

const SlideItem = ({ image, garments, onRemove, onPress }: SlideItemProps) => {
  const imageGarments = garments.filter((g) => image.garmentIds.includes(g.id));

  const handleShare = async () => {
    try {
      await Share.share({ url: image.filePath, message: 'Check out this outfit!' });
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(1000)}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View
        rounded={'$7'}
        width={'80%'}
        height="90%"
        justify={'center'}
        items={'center'}
        bg="$color6"
        elevationAndroid={'$6'}
        position="relative">
        <Pressable onPress={onPress} style={styles.imagePressable}>
          <Image
            source={{ uri: image.filePath, width: 300, height: 400 }}
            width={'100%'}
            height={'100%'}
            rounded={'$7'}
          />
        </Pressable>

        {/* Remove button – top-right */}
        <Button
          position="absolute"
          t={10}
          r={10}
          circular
          size="$2"
          themeInverse
          elevation={'$1'}
          icon={<Trash2 size={14} />}
          onPress={onRemove}
        />

        {/* Share button – bottom-left */}
        <Button
          position="absolute"
          b={10}
          l={10}
          circular
          size="$2"
          themeInverse
          elevation={'$1'}
          icon={<Share2 size={14} />}
          onPress={handleShare}
        />

        {/* Garment previews – bottom-right */}
        {imageGarments.length > 0 && (
          <XStack position="absolute" b={10} r={10} gap={'$1'}>
            {imageGarments.map((garment) => (
              <Image
                key={garment.id}
                source={{ uri: garment.filePath, width: 40, height: 40 }}
                width={40}
                height={40}
                rounded={'$3'}
                borderWidth={1}
                borderColor={'$color1'}
              />
            ))}
          </XStack>
        )}
      </View>
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

  const [selectedImageUri, setSelectedImageUri] = React.useState<string | null>(null);

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
    [PAGE_HEIGHT, PAGE_WIDTH],
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
            onPress={() => setSelectedImageUri(item.filePath)}
          />
        )}
        customAnimation={animationStyle}
        windowSize={5}
      />

      <FullScreenImageModal
        uri={selectedImageUri ?? ''}
        visible={!!selectedImageUri}
        onClose={() => setSelectedImageUri(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imagePressable: {
    flex: 1,
    width: '100%',
  },
  fullScreenImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.85,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 22,
  },
});
