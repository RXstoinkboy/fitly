import React, { memo } from 'react';
import { Sheet } from 'tamagui';
import { Text, YStack } from '@/components/v2/ui';

export const useModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  return { isOpen, setIsOpen, openModal, closeModal };
};

type SelectPhotoModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const SelectPhotoModal = ({ isOpen, setIsOpen }: SelectPhotoModalProps) => {
  return (
    <Sheet
      forceRemoveScrollEnabled={isOpen}
      modal
      open={isOpen}
      onOpenChange={setIsOpen}
      snapPointsMode={'fit'}
      dismissOnSnapToBottom
      zIndex={100_000}
      unmountChildrenWhenHidden
      animation="quick">
      <Sheet.Overlay
        animation="lazy"
        bg="$shadow6"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />

      <Sheet.Handle bg={'$color3'} />
      <Sheet.Frame p="$4" content="center" items="center" gap="$5" bg={'$color3'}>
        <SheetContents />
      </Sheet.Frame>
    </Sheet>
  );
};

const SheetContents = memo(() => {
  return (
    <YStack>
      <Text>Siemka</Text>
    </YStack>
  );
});
SheetContents.displayName = 'SheetContents';
