import { useMount, usePaywall } from '@/hooks';
import { YStack, Text, ScreenWrapper, Image, Button, XStack } from '@/components/v2/ui';
import { generatedKeys } from '@/queries/image-generation/keys';
import { useGeneratedImages, useOnboarding } from '@/state';
import { useIsMutating } from '@tanstack/react-query';
import { Link, usePathname, useRouter } from 'expo-router';
import { ArrowLeft } from '@/icons';
import { PaywallCta } from '@/components/subscription';

export default function Onboarding() {
  const { setOnboardingStep, completeOnboarding } = useOnboarding();
  const router = useRouter();
  const pathname = usePathname();
  const isGenerating = useIsMutating({
    mutationKey: generatedKeys.add(),
  });
  const { images } = useGeneratedImages();
  const generatedImage = images.length > 0 ? images.at(-1)?.filePath : null;
  const { showPaywall, isPresenting } = usePaywall();

  const onFinish = async () => {
    try {
      await showPaywall();
    } catch (error) {
      console.warn('Paywall presentation failed', error);
    } finally {
      completeOnboarding();
      router.replace('/(tabs)');
    }
  };

  useMount(() => {
    setOnboardingStep(pathname);
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
            <PaywallCta />
          </>
        ) : null}
        <Button onPress={onFinish} disabled={isPresenting}>
          {isPresenting ? 'Opening paywall...' : 'Continue'}
        </Button>
        <Link asChild href={'/onboarding/select-garments'}>
          <Button>Back</Button>
        </Link>
      </YStack>
    </ScreenWrapper>
  );
}
