import React, { memo, useState } from 'react';
import { Button, Text, YStack, Sheet } from '@/components/v2/ui';
import { openCamera } from '@/utils/open-camera';
import { openImageLibrary } from '@/utils/open-image-library';
import { ImageSource } from '@/state';

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
  children,
  isOpen,
  toggle,
  onSuccess,
}: {
  step?: number;
  children?: React.ReactNode;
  isOpen: boolean;
  toggle: (visible?: boolean) => void;
  onSuccess: (image: string, source: ImageSource) => void;
}) => {
  return (
    <Sheet forceRemoveScrollEnabled={isOpen} modal open={isOpen} onOpenChange={toggle}>
      <Sheet.Overlay />
      <Sheet.Handle />
      <Sheet.Frame>{children ?? <SheetContents onSuccess={onSuccess} />}</Sheet.Frame>
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

const SheetContents = memo(
  ({ onSuccess }: { onSuccess: (image: string, source: ImageSource) => void }) => {
    const onSuccessCallback = (source: ImageSource) => (image: string) => onSuccess(image, source);

    const getImageFromDeviceLibrary = getImageFromDevice(
      openImageLibrary,
      onSuccessCallback('library'),
    );
    const getImageFromDeviceCamera = getImageFromDevice(openCamera, onSuccessCallback('camera'));

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
  },
);
SheetContents.displayName = 'SheetContents';
