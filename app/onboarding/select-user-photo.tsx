import { SelectPhotoModal, useSelectPhotoModal } from '@/components/modals';
import { View, YStack, Text, Button, Image, XStack, ScreenWrapper } from '@/components/v2/ui';
import { useAddModelImage } from '@/queries/models/add-model';
import { useGetModelsList } from '@/queries/models/get-models-list';
import { ImageUp } from '@tamagui/lucide-icons';
import { Link } from 'expo-router';

export default function SelectUserPhoto() {
  const modelsImageList = useGetModelsList();
  const imageUri = modelsImageList.data?.at(-1);
  const { isOpen, toggle } = useSelectPhotoModal();
  const addModelMutation = useAddModelImage({
    onSuccess: () => {
      toggle(false);
    },
  });

  const onSuccess = (image: string): void => {
    addModelMutation.mutate(image);
  };

  return (
    <ScreenWrapper>
      <YStack flex={1} items={'center'} gap={'$4'}>
        <Text size="xxl" weigth="semiBold">
          Take a photo of yourself
        </Text>
        <Text type="secondary" text="center">
          This photo will be used to try new outfits. Don’t worry, you can change it anytime
        </Text>
        {/* TODO: when no image then show a placeholder */}
        <View position={'relative'}>
          <Image
            source={{ uri: imageUri, width: 300, height: 400 }}
            rounded={'$7'}
            aspectRatio={3 / 4}
          />
          <Button
            onPress={() => toggle()}
            position="absolute"
            t={10}
            r={10}
            rounded={'$radius.12'}
            icon={<ImageUp />}
          />
        </View>
        {imageUri ? (
          <XStack width={'100%'} gap="$2">
            <Link asChild href={'/onboarding/select-garments'}>
              <Button type="primary" flex={1}>
                Go next!
              </Button>
            </Link>
          </XStack>
        ) : (
          <Button
            type="primary"
            stretched
            onPress={() => {
              toggle();
            }}>
            Select photo
          </Button>
        )}

        <YStack width={'100%'} items={'flex-start'}>
          <Text>Photo guidelines for best results:</Text>
          <Text pl={'$3'}>1. Plain background</Text>
          <Text pl={'$3'}>2. Good lightning</Text>
          <Text pl={'$3'}>3. Full body visible</Text>
          <Text pl={'$3'}>4. Wear fitted clothes</Text>
        </YStack>
      </YStack>
      <SelectPhotoModal isOpen={isOpen} toggle={toggle} onSuccess={onSuccess} />
    </ScreenWrapper>
  );
}
