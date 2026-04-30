import { useImageSize, useMount } from '@/hooks';
import { YStack, Text, Button, ScreenWrapper, Image, View } from '@/components/v2/ui';
import { useOnboarding } from '@/state';
import { Link, usePathname } from 'expo-router';
import { analyticsEvents, trackEvent } from '@/lib/analytics';
import { useWindowDimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';

export const WelcomeScreen = () => {
  const { setOnboardingStep } = useOnboarding();
  const pathname = usePathname();
  const { width: imageWidth, height } = useImageSize();
  const { width } = useWindowDimensions();

  useMount(() => {
    setOnboardingStep(pathname);
    trackEvent(analyticsEvents.onboarding.stepViewed(), {
      step: pathname,
    });
  });

  const handleStart = () => {
    trackEvent(analyticsEvents.onboarding.started(), {
      step: pathname,
    });
  };

  const directionAnimVal = useSharedValue(0);
  const images = ['https://picsum.photos/200/300', 'https://picsum.photos/200/300'];

  return (
    <ScreenWrapper>
      <YStack flex={1} items={'center'} gap={'$6'}>
        {/* TODO: add here some attractive stock image */}
        {/* TODO: add animation from first to another image on welcome */}
        {/* TODO: apply similar improvements to main carousel ==> even better extract common carousel wrapper part */}

        <Carousel
          style={{
            width,
            height,
          }}
          loop={false}
          defaultIndex={images.length - 1}
          vertical={false}
          width={width}
          height={height}
          data={images}
          pagingEnabled={true}
          renderItem={({ index, item }) => (
            <View key={index} flex={1} items="center" justify="center">
              <View rounded={'$6'} overflow="hidden" width={imageWidth}>
                <Image src={item} width={imageWidth} height={height} />
              </View>
            </View>
          )}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 1,
            parallaxAdjacentItemScale: 0.9,
            parallaxScrollingOffset: 80,
          }}
          onProgressChange={(_offsetProgress, absoluteProgress) => {
            directionAnimVal.value = absoluteProgress;
          }}
        />
        
        <YStack items={'center'} gap={'$4'} flex={1}>
          <Text size={'xxl'} weight="bold">
            Welcome!
          </Text>
          <Text size="s" type="secondary" text="center">
            You&apos;re one step closer to trying on your favourite styles, right from home
          </Text>
          <Link href="/onboarding/select-user-photo" asChild>
            <Button width={imageWidth} size={'l'} kind="cta" onPress={handleStart}>
              Let&apos;s get started!
            </Button>
          </Link>
        </YStack>
      </YStack>
    </ScreenWrapper>
  );
};
