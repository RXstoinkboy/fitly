import * as React from "react";
import { Image, View } from "tamagui";
import type { CarouselRenderItem, TAnimationStyle } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";
import Animated, { useSharedValue, interpolate, Extrapolation, FadeInDown } from "react-native-reanimated";
import { Dimensions } from "react-native";

const SlideItem = ({ imageUri }: { imageUri: string }) => {
  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <View
        style={{
          width: '75%',
          height: "90%",
          borderRadius: 20,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",

          shadowColor: "#000000d1",
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.51,
          shadowRadius: 20,
          elevation: 20,
        }}
      >
        <Image
          source={{ uri: imageUri, width: 300, height: 400 }}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 20,
          }}
        />
      </View>
    </Animated.View>
  );
};

export function ImagesCarousel({
  height,
  images,
}: {
  height: number;
  images: string[];
}) {
  const { width } = Dimensions.get("window");
  const PAGE_WIDTH = (height * 0.75) || width; // Adjust the multiplier to change the width relative to height
  const PAGE_HEIGHT = height;

  const directionAnimVal = useSharedValue(0);

  const animationStyle: TAnimationStyle = React.useCallback(
    (value: number) => {
      "worklet";
      const translateY = interpolate(value, [0, 1], [0, -30]);
      const translateX =
        interpolate(value, [-1, 0], [PAGE_WIDTH, 0], Extrapolation.CLAMP) * directionAnimVal.value;
      const rotateZ =
        interpolate(value, [-1, 0], [15, 0], Extrapolation.CLAMP) * directionAnimVal.value;

      // Ensure zIndex is always an integer
      const zIndex = Math.round(
        interpolate(
          value,
          [0, 1, 2, 3, 4],
          [0, 1, 2, 3, 4].map((v) => (images.length - v) * 10),
          Extrapolation.CLAMP
        )
      );

      const scale = interpolate(value, [0, 1], [1, 0.92]);
      const opacity = interpolate(value, [-1, -0.8, 0, 1], [0, 0.9, 1, 0.85], Extrapolation.EXTEND);

      return {
        transform: [{ translateY }, { translateX }, { rotateZ: `${rotateZ}deg` }, { scale }],
        zIndex,
        opacity,
      };
    },
    [PAGE_HEIGHT, PAGE_WIDTH]
  );
  return (
    <View style={{ flex: 1 }}>
      <Carousel
        loop={true}
        style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
        }}
        defaultIndex={0}
        vertical={false}
        width={PAGE_WIDTH}
        height={PAGE_HEIGHT}
        data={images}
        onConfigurePanGesture={(g) => {
          g.onChange((e) => {
            "worklet";
            directionAnimVal.value = Math.sign(e.translationX);
          });
        }}
        // fixedDirection="negative"
        renderItem={({ index, item }) => <SlideItem key={index} imageUri={item} />}
        customAnimation={animationStyle}
        windowSize={5}
      />
    </View>
  );
}
