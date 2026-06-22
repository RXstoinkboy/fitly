import { useImageSize, useMount, usePaywall } from '@/hooks';
import {
  YStack,
  Text,
  ScreenWrapper,
  Image,
  Button,
  XStack,
  View,
  Spinner,
} from '@/components/v2/ui';
import { generatedKeys } from '@/queries/image-generation/keys';
import { useCurrentModel, useGeneratedImages, useOnboarding } from '@/state';
import { useIsMutating } from '@tanstack/react-query';
import { Link, usePathname, useRouter } from 'expo-router';
import { ArrowLeft } from '@/icons';
import { analyticsEvents, trackEvent } from '@/lib/analytics';
import { useLoadingState } from '@/hooks/use-loading-state';

const ImageLoader = () => {
  const { currentModel } = useCurrentModel();
  const loadingState = useLoadingState({ isPending: true });

  return (
    <YStack rounded={'$7'} overflow="hidden">
      <YStack
        position="absolute"
        z={'$1'}
        t={'50%'}
        l={'50%'}
        items={'center'}
        transform={'translate(-50%, -50%)'}>
        <Spinner size="large" color="$accent2" />
        <Text color="$color1">{loadingState}</Text>
      </YStack>
      <Image
        src={currentModel?.filePath}
        width={300}
        height={400}
        aspectRatio={3 / 4}
        blurRadius={80}
      />
    </YStack>
  );
};

export const FinishScreen = () => {
  const { setOnboardingStep, completeOnboarding } = useOnboarding();
  const { width } = useImageSize();
  const router = useRouter();
  const pathname = usePathname();
  const isGenerating = useIsMutating({
    mutationKey: generatedKeys.add(),
  });
  const { images } = useGeneratedImages();
  const generatedImage = images.length > 0 ? images.at(-1)?.filePath : null;
  const { showPaywall, isPresenting } = usePaywall();
  const isGenerated = generatedImage && !isGenerating;

  const onFinish = async () => {
    let paywallResult:
      | Awaited<ReturnType<typeof showPaywall>>
      | { paywallResult?: string; status?: { isSubscribed?: boolean | null } }
      | undefined;
    try {
      paywallResult = await showPaywall('onboarding_finish');
    } catch (error) {
      console.warn('Paywall presentation failed', error);
    } finally {
      trackEvent(analyticsEvents.onboarding.completed(), {
        step: pathname,
        generatedImage: Boolean(generatedImage),
        paywallResult: paywallResult?.paywallResult ?? 'error',
        isSubscribed: paywallResult?.status?.isSubscribed,
      });
      completeOnboarding();
      router.replace('/(tabs)');
    }
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
            <Button kind="ghost" icon={<ArrowLeft />}>
              Back
            </Button>
          </Link>
        </XStack>
      }>
      <YStack flex={1} items={'center'} gap={'$4'}>
        <>
          <Text size="xxl" weight="semiBold" text={'center'}>
            {isGenerated ? 'Congratulations!' : 'Loading...'}
          </Text>
          <Text type="secondary" text="center">
            {isGenerated
              ? `That's just the beginning. Now you can explore the app and start trying on outfits!`
              : 'Please wait'}
          </Text>
          <View rounded={'$7'} overflow="hidden">
            {isGenerated && generatedImage ? (
              <Image src={generatedImage} width={300} height={400} aspectRatio={3 / 4} />
            ) : (
              <ImageLoader />
            )}
          </View>
        </>
        <Button width={width} kind="cta" size={'l'} onPress={onFinish} disabled={isPresenting}>
          {isPresenting ? 'Opening paywall...' : 'Continue'}
        </Button>
      </YStack>
    </ScreenWrapper>
  );
};
