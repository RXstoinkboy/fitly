import { Sparkles } from '@/icons';
import { Button, Spinner } from '@/components/v2/ui';
import { useGenerateImageMutation } from '@/queries/image-generation/mutation';
import { useGeneratedImages, useModels, useSelectedGarments } from '@/state';
import { usePaywall } from '@/hooks';
import { analyticsEvents, captureError, trackEvent } from '@/lib/analytics';
import { useLoadingState } from '@/hooks/use-loading-state';

export const GenerateImageButton = () => {
  const { addGeneratedImage } = useGeneratedImages();
  const { currentModelId } = useModels();
  const selectedGarments = useSelectedGarments();
  const { requireSubscription, isPresenting } = usePaywall();

  const { mutate, isPending } = useGenerateImageMutation({
    onSuccess: (data) => {
      if (data && currentModelId) {
        addGeneratedImage(data.filePath, currentModelId, selectedGarments.selectedIds);
      }
    },
    onError: (error) => {
      console.error('Failed to generate image:', error);
      captureError(error, {
        flow: 'app',
        event: analyticsEvents.generation.failed('app'),
      });
      throw error;
    },
  });

  const loadingState = useLoadingState({ isPending });

  const onGenerateImage = async () => {
    if (!currentModelId) {
      console.error('No model selected');
      return;
    }

    const isSubscribed = await requireSubscription('app_generate');
    if (!isSubscribed) {
      return;
    }

    const topGarment = selectedGarments.selectedGarments.find((g) => g.type === 'top');
    const bottomGarment = selectedGarments.selectedGarments.find((g) => g.type === 'bottom');
    const dressGarment = selectedGarments.selectedGarments.find((g) => g.type === 'dress');
    const outerwearGarment = selectedGarments.selectedGarments.find((g) => g.type === 'outerwear');
    const garmentTypes = selectedGarments.selectedGarments.map((garment) => garment.type);
    const garmentIds = selectedGarments.selectedGarments.map((garment) => garment.id);

    trackEvent(analyticsEvents.generation.requested('app'), {
      flow: 'app',
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
      context: 'app',
      modelId: currentModelId,
    });
    selectedGarments.clearSelection();
  };

  return (
    <Button
      bg={'$accent1'}
      size={'$6'}
      width={'100%'}
      disabled={isPending || isPresenting}
      icon={isPending ? Spinner : Sparkles}
      onPress={onGenerateImage}>
      {isPending ? loadingState : 'Create'}
    </Button>
  );
};
