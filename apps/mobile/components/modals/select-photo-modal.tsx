import React, { memo, useState } from 'react';
import { Button, Text, YStack, Sheet, XStack } from '@/components/v2/ui';
import { openCamera } from '@/utils/open-camera';
import { openImageLibrary } from '@/utils/open-image-library';
import { ImageSource } from '@/state';
import { analyticsEvents, trackEvent } from '@/lib/analytics';
import { AnalyticsFlow } from '@/lib/analytics/types';
import { Images, Camera } from '@/icons';

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
      <XStack width={'100%'} gap={'$2'} pb={'$4'} justify={'space-evenly'}>
        <Button
          onPress={getImageFromDeviceLibrary}
          flexDirection="column"
          height={'auto'}
          p="$3"
          flex={1}>
          <Images size={'$3'} />
          Select from gallery
        </Button>
        <Button
          onPress={getImageFromDeviceCamera}
          flexDirection="column"
          height={'auto'}
          p="$3"
          flex={1}>
          <Camera size={'$3'} />
          Use a camera
        </Button>
      </XStack>
    );
  },
);
SheetContents.displayName = 'SheetContents';
