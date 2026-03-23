import { useMount } from '@/hooks';
import { SelectPhotoSheet, useSelectPhotoSheet } from '@/components/modals';
import {
  PhotoGuidelinesInfoButton,
  PhotoGuidelinesSheet,
  usePhotoGuidelinesSheet,
} from '@/components/modals/photo-guidelines-sheet';
import { View, YStack, Text, Button, Image, XStack, ScreenWrapper } from '@/components/v2/ui';
import { ImageSource, useModels, useOnboarding } from '@/state';
import { ArrowLeft, ImageUp } from '@/icons';
import { Link, usePathname } from 'expo-router';
import { useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { analyticsEvents, trackEvent } from '@/lib/analytics';

export default function SelectUserPhoto() {
  const { setOnboardingStep } = useOnboarding();
  const pathname = usePathname();

  const { currentModel, addModel, setCurrentModel, deleteModelPermanently } = useModels();
  const selectPhotoSheet = useSelectPhotoSheet();
  const photoGuidelinesSheet = usePhotoGuidelinesSheet();

  const handleAddModel = async (image: string, source: ImageSource): Promise<void> => {
    const id = await addModel(image, source);
    setCurrentModel(id);
    selectPhotoSheet.toggle(false);

    trackEvent(analyticsEvents.photos.added('model', source), {
      flow: 'onboarding',
      source,
    });
  };

  useMount(() => {
    setOnboardingStep(pathname);
    trackEvent(analyticsEvents.onboarding.stepViewed(), {
      step: pathname,
    });
  });

  useEffect(() => {
    if (!currentModel) {
      return;
    }

    const cleanupMissingModel = async () => {
      const fileInfo = await FileSystem.getInfoAsync(currentModel.filePath);
      if (!fileInfo.exists) {
        await deleteModelPermanently(currentModel.id);
      }
    };

    cleanupMissingModel();
  }, [currentModel, deleteModelPermanently]);

  return (
    <ScreenWrapper
      footer={
        <XStack>
          <Link asChild href={'/onboarding/welcome'}>
            <Button icon={<ArrowLeft />}>Back</Button>
          </Link>
        </XStack>
      }>
      <YStack flex={1} items={'center'} gap={'$4'}>
        <Text size="xxl" weigth="semiBold">
          Take a photo of yourself
        </Text>
        <Text type="secondary" text="center">
          This photo will be used to try new outfits. Don’t worry, you can change it anytime
        </Text>
        <View position={'relative'}>
          {/* TODO: when no image then show a placeholder */}
          {currentModel ? (
            <Image
              src={currentModel?.filePath}
              width={300}
              height={400}
              rounded={'$7'}
              aspectRatio={3 / 4}
            />
          ) : null}

          <Button
            onPress={() => selectPhotoSheet.toggle()}
            position="absolute"
            t={10}
            r={10}
            rounded={'$radius.12'}
            icon={<ImageUp />}
          />
        </View>
        {currentModel?.filePath ? (
          <XStack width={'100%'} gap="$2">
            <Link asChild href={'/onboarding/select-garments'}>
              <Button flex={1}>Go next!</Button>
            </Link>
          </XStack>
        ) : (
          <Button
            onPress={() => {
              selectPhotoSheet.toggle();
            }}>
            Select photo
          </Button>
        )}

        <PhotoGuidelinesInfoButton onPress={() => photoGuidelinesSheet.toggle()} />
      </YStack>
      <SelectPhotoSheet
        isOpen={selectPhotoSheet.isOpen}
        toggle={selectPhotoSheet.toggle}
        onSuccess={handleAddModel}
        subject="model"
        flow="onboarding"
      />
      <PhotoGuidelinesSheet
        isOpen={photoGuidelinesSheet.isOpen}
        toggle={photoGuidelinesSheet.toggle}
      />
    </ScreenWrapper>
  );
}
