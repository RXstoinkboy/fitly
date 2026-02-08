import { YStack, Text, Button, ScreenWrapper } from '@/components/v2/ui';
import { SelectGarmentType, SelectPhotoModal } from '@/components/modals';
import { useEffect } from 'react';
import { Link, usePathname } from 'expo-router';
import { useGeneratedImages, useModels, useOnboarding } from '@/state';
import { useGenerateImageMutation } from '@/queries/image-generation/mutation';
import { SelectGarment, useSelectGarment } from '@/components/garments';

export default function Onboarding() {
  const pathname = usePathname();
  const { setOnboardingStep } = useOnboarding();
  const {
    tempImage,
    onImageSelected,
    handleAddGarment,
    selectPhotoModal,
    selectedGarments,
    garments,
  } = useSelectGarment();

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

    mutate({
      top: topGarment?.filePath,
      bottom: bottomGarment?.filePath,
    });
    selectedGarments.clearSelection();
  };

  useEffect(() => {
    setOnboardingStep(pathname);
  }, []);

  return (
    <ScreenWrapper>
      <YStack flex={1} items={'center'} gap={'$4'}>
        <Text size="xxl" weigth="semiBold" text={'center'}>
          What you&apos;d like to wear?
        </Text>
        <Text type="secondary" text="center">
          Select garments you want to try on
        </Text>

        <SelectGarment
          removeGarment={garments.removeGarment}
          selectedGarments={selectedGarments.selectedGarments}
          toggle={selectPhotoModal.toggle}
          toggleSelection={selectedGarments.toggleSelection}
        />
        {/* TODO: or maybe even hide it when there are no clothes added yet */}
        <Link asChild href={'/onboarding/finish'}>
          <Button type="primary" stretched disabled={!isAnyImageSelected} onPress={onGenerateImage}>
            Try this look!
          </Button>
        </Link>
        {/* TODO: move it to some less visible place (same for other steps too) */}
        <Link asChild href={'/onboarding/select-user-photo'}>
          <Button type="ghost">Back</Button>
        </Link>
      </YStack>

      <SelectPhotoModal
        isOpen={selectPhotoModal.isOpen}
        toggle={selectPhotoModal.toggle}
        onSuccess={onImageSelected}>
        {tempImage ? <SelectGarmentType image={tempImage} onSuccess={handleAddGarment} /> : null}
      </SelectPhotoModal>
    </ScreenWrapper>
  );
}
