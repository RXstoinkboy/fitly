import { SelectPhotoModal, useSelectPhotoModal } from '@/components/modals';
import { UserPhoto } from '@/components/onboarding/user-photo';
import { YStack, Text, Button, XStack, ScreenWrapper } from '@/components/v2/ui';
import { database } from '@/db';
import { Model } from '@/db/models';
import { useAddModelImage } from '@/queries/models/add-model';
import { useGetModelsList } from '@/queries/models/get-models-list';
import { Q } from '@nozbe/watermelondb';
import { Link } from 'expo-router';

// const model = database.get<Model>('models').query(Q.where('is_current', true));
const model = database.get<Model>('models').query(Q.where('is_current', true));

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
        <UserPhoto onReplace={toggle} model={model} />
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

        {/* TODO: show only when no photo selected */}
        {/* TODO: when photo is selected then maybe hide it in a sheet? */}
        <YStack width={'100%'} items={'flex-start'}>
          <Text type="secondary">Photo guidelines for best results:</Text>
          <Text type="secondary" pl={'$3'}>
            1. Plain background
          </Text>
          <Text type="secondary" pl={'$3'}>
            2. Good lightning
          </Text>
          <Text type="secondary" pl={'$3'}>
            3. Full body visible
          </Text>
          <Text type="secondary" pl={'$3'}>
            4. Wear fitted clothes
          </Text>
        </YStack>
      </YStack>
      <SelectPhotoModal isOpen={isOpen} toggle={toggle} onSuccess={onSuccess} />
    </ScreenWrapper>
  );
}
