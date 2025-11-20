import React, { memo } from 'react';
import { Button, Text, YStack, Sheet } from '@/components/v2/ui';
import { usePhotoModalStore } from '@/stores/select-photo-modal';
import { openCamera } from '@/lib/open-camera';
import { openImageLibrary } from '@/lib/open-image-library';
import { useAddModelImage } from '@/queries/models/add-model';

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
      unmountChildrenWhenHidden
      animation="quick">
      <Sheet.Overlay
        bg={'$shadow3'}
        animation="medium"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      {/* <Sheet.Handle borderColor={'$borderColor'} borderWidth={1} /> */}
      <Sheet.Frame
        p="$4"
        content="center"
        items="center"
        gap="$5"
        borderColor={'$borderColor'}
        borderWidth={1}>
        <SheetContents />
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

const SheetContents = memo(() => {
  const addModelMutation = useAddModelImage();

  const getImageFromDeviceLibrary = getImageFromDevice(openImageLibrary, addModelMutation.mutate);
  const getImageFromDeviceCamera = getImageFromDevice(openCamera, addModelMutation.mutate);

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
