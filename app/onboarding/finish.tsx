import { YStack, Text, ScreenWrapper, Image } from '@/components/v2/ui';
import { useGetGeneratedImagesList } from '@/queries/image-generation/get-generated-images-list';
import { generatedKeys } from '@/queries/image-generation/keys';
import { useIsMutating } from '@tanstack/react-query';

export default function Onboarding() {
  const isGenerating = useIsMutating({
    mutationKey: generatedKeys.add(),
  });
  const getGeneratedImagesList = useGetGeneratedImagesList();
  const generatedImage = getGeneratedImagesList.data?.at(-1);

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
      </YStack>
    </ScreenWrapper>
  );
}
