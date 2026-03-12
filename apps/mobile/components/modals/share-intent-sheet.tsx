import React from 'react';
import { Button, Image, Sheet, Text, YStack } from '@/components/v2/ui';
import type { GarmentType } from '@/state';

type ShareIntentSheetProps = {
  open: boolean;
  imageUri?: string;
  isProcessing?: boolean;
  onSelect: (selection: GarmentType | 'model') => void;
  onDismiss: () => void;
};

export const ShareIntentSheet = ({
  open,
  imageUri,
  isProcessing = false,
  onSelect,
  onDismiss,
}: ShareIntentSheetProps) => {
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onDismiss();
    }
  };

  return (
    <Sheet modal open={open} onOpenChange={handleOpenChange}>
      <Sheet.Overlay />
      <Sheet.Handle />
      <Sheet.Frame gap="$4" w="100%">
        <YStack w="100%" gap="$3">
          <Text fontWeight="700">Save shared image</Text>
          <Text color="$color10">
            Choose where to place this image. It will be added to your gallery after selection.
          </Text>
        </YStack>

        {imageUri ? (
          <Image
            src={imageUri}
            width="100%"
            aspectRatio={3 / 4}
            maxHeight={320}
            borderRadius="$5"
          />
        ) : null}

        <YStack w="100%" gap="$3">
          <Button onPress={() => onSelect('model')} disabled={isProcessing}>
            Save as model photo
          </Button>
          <Button onPress={() => onSelect('top')} disabled={isProcessing}>
            Add as top garment
          </Button>
          <Button onPress={() => onSelect('bottom')} disabled={isProcessing}>
            Add as bottom garment
          </Button>
          <Button onPress={onDismiss} disabled={isProcessing}>
            Dismiss
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};
