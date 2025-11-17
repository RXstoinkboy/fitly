import React, { memo } from 'react';
import { Sheet } from 'tamagui';
import { Button, Text, YStack } from '@/components/v2/ui';
import { usePhotoModalStore } from '@/stores/select-photo-modal';

export const SelectPhotoModal = () => {
  const isOpen = usePhotoModalStore((state) => state.visible);
  const toggle = usePhotoModalStore((state) => state.toggle);

  return (
    <Sheet
      forceRemoveScrollEnabled={isOpen}
      modal
      open={isOpen}
      onOpenChange={toggle}
      snapPointsMode={'fit'}
      dismissOnSnapToBottom
      zIndex={100_000}
      unmountChildrenWhenHidden
      animation="quick">
      <Sheet.Overlay
        animation="medium"
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
    <YStack width={'100%'} gap={'$2'}>
      <Button stretched>Select from gallery</Button>
      <Text self={'center'}>or</Text>
      <Button stretched>Use a camera</Button>
    </YStack>
  );
});
SheetContents.displayName = 'SheetContents';
