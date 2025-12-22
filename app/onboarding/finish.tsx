import { YStack, Text, ScreenWrapper, Image, Button } from '@/components/v2/ui';
import { OnboardingStatus } from '@/lib/onboarding/types';
import { useGetGeneratedImagesList } from '@/queries/image-generation/get-generated-images-list';
import { generatedKeys } from '@/queries/image-generation/keys';
import { useUpdateStatus } from '@/queries/onboarding/update-status';
import { useIsMutating } from '@tanstack/react-query';
import { Link } from 'expo-router';

export default function Onboarding() {
  const updateStatus = useUpdateStatus();
  const isGenerating = useIsMutating({
    mutationKey: generatedKeys.add(),
  });
  const getGeneratedImagesList = useGetGeneratedImagesList();
  const generatedImage = getGeneratedImagesList.data?.at(-1);

  const onFinish = () => {
    updateStatus.mutate(OnboardingStatus.Completed);
  };

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
        <Link asChild href={'/onboarding/finish'}>
          <Button type="primary" stretched onPress={onFinish}>
            Continue
          </Button>
        </Link>
      </YStack>
    </ScreenWrapper>
  );
}
