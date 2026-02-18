import { Wand2 } from '@tamagui/lucide-icons';
import { Spinner } from 'tamagui';
import { Button } from './button';
import { Text } from '@/components/v2/ui';
import { useGenerateImageMutation } from '@/queries/image-generation/mutation';
import { useGeneratedImages, useModels, useSelectedGarments } from '@/state';
import { useEffect, useState } from 'react';

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

    mutate({
      top: topGarment?.filePath,
      bottom: bottomGarment?.filePath,
    });
    selectedGarments.clearSelection();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPending) {
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
      }, 2000);
    } else {
      setLoadingState(null);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isPending]);

  return (
    <>
      <Text>{isPending ? 'PENDING' : 'IDLE'}</Text>
      <Button
        buttonSize="lg"
        rounded={'$radius.12'}
        flex={1}
        primary
        disabled={isPending}
        icon={isPending ? Spinner : Wand2}
        onPress={onGenerateImage}
        elevation={'$2'}>
        {isPending ? loadingStates[loadingState ?? 0] : 'Create'}
      </Button>
    </>
  );
};
