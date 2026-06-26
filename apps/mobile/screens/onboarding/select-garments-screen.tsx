import { useImageSize, useMount } from '@/hooks';
import { YStack, Text, Button, ScreenWrapper, XStack } from '@/components/v2/ui';
import { SelectGarmentType, SelectPhotoSheet } from '@/components/modals';
import { Link, usePathname } from 'expo-router';
import { useGeneratedImages, useModels, useOnboarding } from '@/state';
import { useGenerateImageMutation } from '@/queries/image-generation/mutation';
import { SelectGarment, useSelectGarment } from '@/components/v2/domain';
import { ArrowLeft } from '@/icons';
import { analyticsEvents, trackEvent } from '@/lib/analytics';

export const SelectGarmentsScreen = () => {
  const pathname = usePathname();
  const { setOnboardingStep } = useOnboarding();
  const {
    tempImage,
    onImageSelected,
    handleAddGarment,
    selectPhotoSheet,
    selectedGarments,
    garments,
  } = useSelectGarment('onboarding');
  const { width } = useImageSize();

  const { addGeneratedImage } = useGeneratedImages();
  const { currentModelId } = useModels();
  const { mutate } = useGenerateImageMutation({
    onSuccess: (data) => {
      if (data && currentModelId) {
        addGeneratedImage(data.filePath, currentModelId, selectedGarments.selectedIds);
      }
    },
    onError: (error) => {
      console.error('Failed to generate image:', error);
    },
  });

  const isAnyImageSelected = selectedGarments.selectedIds.length > 0;

  const onGenerateImage = () => {
    if (!currentModelId) {
      console.error('No model selected');
      return;
    }

    const topGarment = selectedGarments.selectedGarments.find((g) => g.type === 'top');
    const bottomGarment = selectedGarments.selectedGarments.find((g) => g.type === 'bottom');
    const dressGarment = selectedGarments.selectedGarments.find((g) => g.type === 'dress');
    const outerwearGarment = selectedGarments.selectedGarments.find((g) => g.type === 'outerwear');
    const garmentTypes = selectedGarments.selectedGarments.map((garment) => garment.type);
    const garmentIds = selectedGarments.selectedGarments.map((garment) => garment.id);

    trackEvent(analyticsEvents.generation.requested('onboarding'), {
      flow: 'onboarding',
      garmentTypes,
      garmentCount: garmentTypes.length,
      modelId: currentModelId,
    });

    mutate({
      top: topGarment?.filePath,
      bottom: bottomGarment?.filePath,
      dress: dressGarment?.filePath,
      outerwear: outerwearGarment?.filePath,
      garments: {
        ids: garmentIds,
        types: garmentTypes,
        count: garmentTypes.length,
      },
      context: 'onboarding',
      modelId: currentModelId,
    });
    selectedGarments.clearSelection();
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
          <Link asChild href={'/onboarding/select-user-photo'}>
            <Button kind="ghost" icon={<ArrowLeft />}>
              Back
            </Button>
          </Link>
        </XStack>
      }>
      <YStack flex={1} items={'center'} gap={'$4'}>
        <Text size="xxl" weight="bold" fontFamily={'$heading'} text={'center'}>
          What you&apos;d like to wear?
        </Text>
        <Text type="secondary" size="s">
          Select garments you want to try on
        </Text>

        <SelectGarment
          removeGarment={garments.removeGarment}
          selectedGarments={selectedGarments.selectedGarments}
          toggle={selectPhotoSheet.toggle}
          toggleSelection={selectedGarments.toggleSelection}
        />
        {/* TODO: or maybe even hide it when there are no clothes added yet */}
        <Link asChild href={'/onboarding/finish'}>
          <Button
            width={width}
            kind="cta"
            size={'l'}
            disabled={!isAnyImageSelected}
            onPress={onGenerateImage}>
            Try this look!
          </Button>
        </Link>
      </YStack>

      <SelectPhotoSheet
        isOpen={selectPhotoSheet.isOpen}
        toggle={selectPhotoSheet.toggle}
        onSuccess={onImageSelected}
        subject="garment"
        flow="onboarding">
        {tempImage ? <SelectGarmentType image={tempImage} onSuccess={handleAddGarment} /> : null}
      </SelectPhotoSheet>
    </ScreenWrapper>
  );
};
