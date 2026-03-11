import { Camera, ImageUp, LayoutGrid } from '@/icons';
import { Button, Sheet, YStack, Text } from '../v2/ui';

type ChangeModelSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCamera: () => void;
  onSelectLibrary: () => void;
  onGoToGallery: () => void;
  isLoading: boolean;
};

export const ChangeModelSheet = ({
  isOpen,
  onOpenChange,
  onSelectCamera,
  onSelectLibrary,
  onGoToGallery,
  isLoading,
}: ChangeModelSheetProps) => {
  return (
    <Sheet disableRemoveScroll={isOpen} modal open={isOpen} onOpenChange={onOpenChange}>
      <Sheet.Overlay />
      <Sheet.Handle />
      <Sheet.Frame width="100%">
        <YStack gap="$3" width="100%">
          <Text size="l" weigth="semiBold">
            Change model
          </Text>
          <Button width="100%" icon={<Camera />} onPress={onSelectCamera} disabled={isLoading}>
            Use camera
          </Button>
          <Button width="100%" icon={<ImageUp />} onPress={onSelectLibrary} disabled={isLoading}>
            Choose from library
          </Button>
          <Button width="100%" icon={<LayoutGrid />} onPress={onGoToGallery}>
            Pick from model gallery
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};
