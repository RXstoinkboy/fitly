import * as React from "react";
import { Image, View } from "tamagui";
import type { CarouselRenderItem } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";
import { Dimensions } from "react-native";

const SlideItem = ({ imageUri }: { imageUri: string }) => {
  return (
    <View flex={1} p={"$2"}>
      <Image
        rounded={"$6"}
        key={imageUri}
        source={{ uri: imageUri, width: 300, height: 400 }}
        objectFit="cover"
        height={"100%"}
        width={"100%"}
      />
    </View>
  );
};

export const renderItem =
  (): CarouselRenderItem<any> =>
  // eslint-disable-next-line react/display-name
  ({ index, item }: { index: number; item: string }) => (
    <SlideItem key={index} imageUri={item} />
  );

export function ImagesCarousel({
  height,
  images,
}: {
  height: number;
  images: string[];
}) {
  const { width } = Dimensions.get("screen");
  const carouselWidth = width;
  const carouselHeight = height;

  console.log("images", images);
  console.log("images.length", images.length);
  return (
    <Carousel
      data={images}
      height={carouselHeight}
      loop={false}
      pagingEnabled={true}
      snapEnabled={true}
      width={carouselWidth}
      mode={"parallax"}
      defaultIndex={images.length - 1}
      modeConfig={{
        parallaxScrollingScale: 0.9,
        parallaxScrollingOffset: 55,
      }}
      renderItem={renderItem()}
      customConfig={() => ({ viewCount: images.length })}
    />
  );
}
