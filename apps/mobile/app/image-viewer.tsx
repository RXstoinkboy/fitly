import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, View, getToken } from 'tamagui';
import { X } from '@tamagui/lucide-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Button } from '@/components/ui-legacy';

// TODO: Consider extracting ZoomableImage into a shared component reusable in
// the main gallery view – users should also be able to press an image there to
// enlarge / zoom it inline.

const MIN_SCALE = 1;
const MAX_SCALE = 2;

export default function ImageViewerScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const router = useRouter();

  const scale = useSharedValue(MIN_SCALE);
  const savedScale = useSharedValue(MIN_SCALE);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const savedOffsetX = useSharedValue(0);
  const savedOffsetY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > MIN_SCALE) {
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
      if (scale.value > MIN_SCALE) {
        scale.value = withSpring(MIN_SCALE);
        savedScale.value = MIN_SCALE;
        offsetX.value = withSpring(0);
        offsetY.value = withSpring(0);
        savedOffsetX.value = 0;
        savedOffsetY.value = 0;
      } else {
        scale.value = withSpring(MAX_SCALE);
        savedScale.value = MAX_SCALE;
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

  return (
    <View flex={1} bg="rgba(0,0,0,0.95)" justify="center" items="center">
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[{ flex: 1, width: '100%' }, animatedStyle]}>
          <Image
            source={{ uri: uri as string }}
            width="100%"
            height="100%"
            resizeMode="contain"
          />
        </Animated.View>
      </GestureDetector>
      <Button
        position="absolute"
        t={'$4'}
        r={'$4'}
        circular
        themeInverse
        elevation={'$1'}
        icon={<X size={getToken('$1')} />}
        onPress={() => router.back()}
      />
    </View>
  );
}
