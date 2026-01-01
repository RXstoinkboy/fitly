import React, { memo, useState } from 'react';
import { Button, Text, YStack, Sheet } from '@/components/v2/ui';
import { openCamera } from '@/utils/open-camera';
import { openImageLibrary } from '@/utils/open-image-library';

export const useSelectPhotoModal = () => {
  const [opened, setOpened] = useState(false);
  const toggle = (opened?: boolean) => {
    setOpened((prev) => opened ?? !prev);
  };

  return {
    isOpen: opened,
    toggle,
  };
};

export const SelectPhotoModal = ({
  isOpen,
  toggle,
  onSuccess,
}: {
  isOpen: boolean;
  toggle: (visible?: boolean) => void;
  onSuccess: (image: string) => void;
}) => {
  return (
    <Sheet forceRemoveScrollEnabled={isOpen} modal open={isOpen} onOpenChange={toggle}>
      <Sheet.Overlay />
      <Sheet.Handle />
      <Sheet.Frame>
        <SheetContents onSuccess={onSuccess} />
      </Sheet.Frame>
    </Sheet>
  );
};

const getImageFromDevice =
  (imageGetterFn: () => Promise<string | null>, onSuccess: (image: string) => void) => async () => {
    const selectedImage = await imageGetterFn();

    if (selectedImage) {
      return onSuccess(selectedImage);
    }
  };

const SheetContents = memo(({ onSuccess }: { onSuccess: (image: string) => void }) => {
  const getImageFromDeviceLibrary = getImageFromDevice(openImageLibrary, onSuccess);
  const getImageFromDeviceCamera = getImageFromDevice(openCamera, onSuccess);

  return (
    <YStack width={'100%'} gap={'$2'}>
      <Button onPress={getImageFromDeviceLibrary} stretched>
        Select from gallery
      </Button>
      <Text self={'center'}>or</Text>
      <Button onPress={getImageFromDeviceCamera} stretched>
        Use a camera
      </Button>
    </YStack>
  );
});
SheetContents.displayName = 'SheetContents';
