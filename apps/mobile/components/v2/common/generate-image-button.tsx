import { Wand2 } from '@/icons';
import { Button, Spinner } from '@/components/v2/ui';
import { useGenerateImageMutation } from '@/queries/image-generation/mutation';
import { useGeneratedImages, useModels, useSelectedGarments } from '@/state';
import { useEffect, useState } from 'react';
import { analyticsEvents, captureError, trackEvent } from '@/lib/analytics';

const loadingStates = [
  'Sending images...',
  'Analyzing content...',
  'Generating image...',
  'Hold on...',
  'Almost there...',
];

export const GenerateImageButton = () => {
  const [loadingState, setLoadingState] = useState<number | null>(null);

  const { addGeneratedImage } = useGeneratedImages();
  const { currentModelId } = useModels();
  const selectedGarments = useSelectedGarments();

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

  const onGenerateImage = () => {
    if (!currentModelId) {
      console.error('No model selected');
      return;
    }

    const topGarment = selectedGarments.selectedGarments.find((g) => g.type === 'top');
    const bottomGarment = selectedGarments.selectedGarments.find((g) => g.type === 'bottom');
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

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    let intervalTime = 3000;

    if (isPending) {
      setLoadingState(0);
      interval = setInterval(() => {
        setLoadingState((prev) => {
          if (prev === null) {
            return 0;
          }

          if (prev >= loadingStates.length - 1) {
            return prev;
          }

          return prev + 1;
        });
      }, intervalTime);
    } else {
      setLoadingState(null);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPending]);

  return (
    <Button disabled={isPending} icon={isPending ? Spinner : Wand2} onPress={onGenerateImage}>
      {isPending ? loadingStates[loadingState ?? 0] : 'Create'}
    </Button>
  );
};
