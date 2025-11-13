import { ChevronDown } from '@tamagui/lucide-icons';
import React, { memo } from 'react';
import { Button, Input, Sheet } from 'tamagui';

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

      <Sheet.Handle />
      <Sheet.Frame p="$4" content="center" items="center" gap="$5">
        {/* <SheetContents /> */}
        <>
          <Button size="$6" circular icon={ChevronDown} onPress={() => setIsOpen(false)} />
          <Input width={200} />
        </>
      </Sheet.Frame>
    </Sheet>
  );
};

// in general good to memoize the contents to avoid expensive renders during animations
const SheetContents = memo(({ modal, isPercent, innerOpen, setInnerOpen, setOpen }: any) => {
  return (
    <>
      <Button size="$6" circular icon={ChevronDown} onPress={() => setOpen(false)} />
      <Input width={200} />
    </>
  );
});
SheetContents.displayName = 'SheetContents';
