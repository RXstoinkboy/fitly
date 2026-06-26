import { useImageSize, useMount } from '@/hooks';
import { SelectPhotoSheet, useSelectPhotoSheet } from '@/components/modals';
import {
  PhotoGuidelinesInfoButton,
  PhotoGuidelinesSheet,
  usePhotoGuidelinesSheet,
} from '@/components/modals/photo-guidelines-sheet';
import {
  View,
  YStack,
  Text,
  Button,
  Image,
  XStack,
  ScreenWrapper,
  NoImagePlaceholder,
} from '@/components/v2/ui';
import { ImageSource, useModels, useOnboarding } from '@/state';
import { ArrowLeft, Repeat } from '@/icons';
import { Link, usePathname } from 'expo-router';
import { useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { analyticsEvents, trackEvent } from '@/lib/analytics';

export const SelectUserPhotoScreen = () => {
  const { setOnboardingStep } = useOnboarding();
  const pathname = usePathname();
  const { width, height } = useImageSize();

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
            <Button kind="ghost" icon={<ArrowLeft />}>
              Back
            </Button>
          </Link>
        </XStack>
      }>
      <YStack flex={1} items={'center'} gap={'$6'}>
        {currentModel ? (
          <View width={width} height={height} rounded={'$7'} overflow="hidden" position="relative">
            <Image
              src={currentModel?.filePath}
              width={width}
              height={height}
              rounded={'$7'}
              aspectRatio={3 / 4}
            />
            <Button
              onPress={() => selectPhotoSheet.toggle()}
              position="absolute"
              t={10}
              r={10}
              rounded={'$radius.12'}
              icon={<Repeat />}
              width={'$3'}
              height={'$3'}
              iconSize={'$4'}
            />
          </View>
        ) : (
          <View
            width={width}
            height={height}
            rounded={'$7'}
            bg={'$color3'}
            overflow="hidden"
            onPress={(d) => {
              selectPhotoSheet.toggle();
            }}>
            <NoImagePlaceholder text="Add your photo" />
          </View>
        )}

        <YStack gap={'$4'} items={'center'}>
          <Text size="xxl" weight="bold" fontFamily={'$heading'}>
            Add you photo
          </Text>
          <Text size="s" type="secondary" text="center">
            This photo will be used to try new outfits. Don&apos;t worry, you can change it anytime
          </Text>
          {currentModel?.filePath ? (
            <Link asChild href={'/onboarding/select-garments'}>
              <Button size="l" kind="cta" width={width}>
                Go next!
              </Button>
            </Link>
          ) : null}
          <PhotoGuidelinesInfoButton onPress={() => photoGuidelinesSheet.toggle()} />
        </YStack>
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
};
