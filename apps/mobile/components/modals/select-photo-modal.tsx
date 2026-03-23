import React, { memo, useState } from 'react';
import { Button, Text, YStack, Sheet } from '@/components/v2/ui';
import { openCamera } from '@/utils/open-camera';
import { openImageLibrary } from '@/utils/open-image-library';
import { ImageSource } from '@/state';
import { analyticsEvents, trackEvent } from '@/lib/analytics';
import { AnalyticsFlow } from '@/lib/analytics/types';

export const useSelectPhotoSheet = () => {
  const [opened, setOpened] = useState(false);
  const toggle = (opened?: boolean) => {
    setOpened((prev) => opened ?? !prev);
  };

  return {
    isOpen: opened,
    toggle,
  };
};

export const SelectPhotoSheet = ({
  children,
  isOpen,
  toggle,
  onSuccess,
  subject = 'model',
  flow = 'app',
}: {
  step?: number;
  children?: React.ReactNode;
  isOpen: boolean;
  toggle: (visible?: boolean) => void;
  onSuccess: (image: string, source: ImageSource) => void;
  subject?: 'model' | 'garment';
  flow?: AnalyticsFlow;
}) => {
  return (
    <Sheet disableRemoveScroll={isOpen} modal open={isOpen} onOpenChange={toggle}>
      <Sheet.Overlay />
      <Sheet.Handle />
      <Sheet.Frame>
        {children ?? <SheetContents onSuccess={onSuccess} subject={subject} flow={flow} />}
      </Sheet.Frame>
    </Sheet>
  );
};

const getImageFromDevice = (
  imageGetterFn: () => Promise<string | null>,
  onSuccess: (image: string) => void,
) => {
  return async () => {
    const selectedImage = await imageGetterFn();

    if (selectedImage) {
      return onSuccess(selectedImage);
    }

    return null;
  };
};

const SheetContents = memo(
  ({
    onSuccess,
    subject,
    flow,
  }: {
    onSuccess: (image: string, source: ImageSource) => void;
    subject: 'model' | 'garment';
    flow: AnalyticsFlow;
  }) => {
    const onSuccessCallback =
      (source: ImageSource) =>
      (image: string): void => {
        trackEvent(analyticsEvents.photos.added(subject, source), {
          flow,
          subject,
          source,
        });
        onSuccess(image, source);
      };

    const getImageFromDeviceLibrary = getImageFromDevice(
      openImageLibrary,
      onSuccessCallback('library'),
    );
    const getImageFromDeviceCamera = getImageFromDevice(openCamera, onSuccessCallback('camera'));

    return (
      <YStack width={'100%'} gap={'$2'}>
        <Button onPress={getImageFromDeviceLibrary}>Select from gallery</Button>
        <Text self={'center'}>or</Text>
        <Button onPress={getImageFromDeviceCamera}>Use a camera</Button>
      </YStack>
    );
  },
);
SheetContents.displayName = 'SheetContents';
