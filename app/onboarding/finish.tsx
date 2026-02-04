import { YStack, Text, ScreenWrapper, Image, Button } from '@/components/v2/ui';
import { generatedKeys } from '@/queries/image-generation/keys';
import { useGeneratedImages, useOnboarding } from '@/state';
import { useIsMutating } from '@tanstack/react-query';
import { Link, usePathname } from 'expo-router';
import { useEffect } from 'react';

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
  };

  useEffect(() => {
    setOnboardingStep(pathname);
  }, []);

  return (
    <ScreenWrapper>
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
              source={{ uri: generatedImage, width: 300, height: 400 }}
              rounded={'$7'}
              aspectRatio={3 / 4}
            />
          </>
        ) : null}
        <Link asChild href={'/(tabs)'}>
          <Button type="primary" stretched onPress={onFinish}>
            Continue
          </Button>
        </Link>
        <Link asChild href={'/onboarding/select-garments'}>
          <Button type="ghost">Back</Button>
        </Link>
      </YStack>
    </ScreenWrapper>
  );
}
