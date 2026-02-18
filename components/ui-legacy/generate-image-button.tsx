import { Wand2 } from '@tamagui/lucide-icons';
import { Spinner } from 'tamagui';
import { Button } from './button';
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
  const [loadingState, setLoadingState] = useState<string | null>(null);

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

  useEffect(() => {}, [isPending]);

  return (
    <Button
      buttonSize="lg"
      rounded={'$radius.12'}
      flex={1}
      primary
      disabled={isPending}
      icon={isPending ? Spinner : Wand2}
      onPress={onGenerateImage}
      elevation={'$2'}>
      {isPending ? 'Creating...' : 'Create'}
    </Button>
  );
};
