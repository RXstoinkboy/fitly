import { useMount } from '@/hooks';
import { YStack, Text, ScreenWrapper, Image, Button, XStack } from '@/components/v2/ui';
import { generatedKeys } from '@/queries/image-generation/keys';
import { useGeneratedImages, useOnboarding } from '@/state';
import { useIsMutating } from '@tanstack/react-query';
import { Link, usePathname } from 'expo-router';
import { ArrowLeft } from '@/icons';
import { analyticsEvents, trackEvent } from '@/lib/analytics';

export default function Onboarding() {
  const { setOnboardingStep, completeOnboarding } = useOnboarding();
  const pathname = usePathname();
  const isGenerating = useIsMutating({
    mutationKey: generatedKeys.add(),
  });
  const { images } = useGeneratedImages();
  const generatedImage = images.length > 0 ? images.at(-1)?.filePath : null;

  const onFinish = () => {
    // TODO: show paywall
    completeOnboarding();
    trackEvent(analyticsEvents.onboarding.completed(), {
      step: pathname,
      generatedImage: Boolean(generatedImage),
    });
  };

  useMount(() => {
    setOnboardingStep(pathname);
    trackEvent(analyticsEvents.onboarding.stepViewed(), {
      step: pathname,
    });
  });

  return (
    <ScreenWrapper
      footer={
        <XStack>
          <Link asChild href={'/onboarding/select-garments'}>
            <Button icon={<ArrowLeft />}>Back</Button>
          </Link>
        </XStack>
      }>
      <YStack flex={1} items={'center'} gap={'$4'}>
        {isGenerating ? (
          <>
            <Text size="xxl" weigth="semiBold" text={'center'}>
              {'Loading...'}
            </Text>
            <Text type="secondary" text="center">
              Please wait
            </Text>
          </>
        ) : null}
        {generatedImage && !isGenerating ? (
          <>
            <Text size="xxl" weigth="semiBold" text={'center'}>
              {'Congratulations!'}
            </Text>
            <Text type="secondary" text="center">
              That&apos;s just the beginning. Now you can explore the app and start trying on
              outfits!
            </Text>
            <Image
              src={generatedImage}
              width={300}
              height={400}
              rounded={'$7'}
              aspectRatio={3 / 4}
            />
          </>
        ) : null}
        <Link asChild href={'/(tabs)'}>
          <Button onPress={onFinish}>Continue</Button>
        </Link>
        <Link asChild href={'/onboarding/select-garments'}>
          <Button>Back</Button>
        </Link>
      </YStack>
    </ScreenWrapper>
  );
}
