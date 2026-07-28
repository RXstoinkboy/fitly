import React, { memo, useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Sheet, XStack, View } from '@/components/v2/ui';
import { openCamera } from '@/utils/open-camera';
import { openImageLibrary } from '@/utils/open-image-library';
import { ImageSource } from '@/state';
import { analyticsEvents, trackEvent } from '@/lib/analytics';
import { AnalyticsFlow } from '@/lib/analytics/types';
import { Images, Camera } from '@/icons';
import { ImageEditor } from 'expo-dynamic-image-crop';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);
  const [pendingSource, setPendingSource] = useState<ImageSource | null>(null);

  const handleEditingCancel = useCallback(() => {
    setPendingImageUri(null);
    setPendingSource(null);
  }, []);

  const handleEditingComplete = useCallback(
    (result: { uri: string }) => {
      if (pendingSource) {
        trackEvent(analyticsEvents.photos.added(subject, pendingSource), {
          flow,
          subject,
          source: pendingSource,
        });
        onSuccess(result.uri, pendingSource);
      }
      setPendingImageUri(null);
      setPendingSource(null);
    },
    [pendingSource, subject, flow, onSuccess],
  );

  const handleImageSelected = useCallback((image: string, source: ImageSource) => {
    setPendingImageUri(image);
    setPendingSource(source);
    toggle(false);
  }, [toggle]);

  return (
    <>
      <Sheet disableRemoveScroll={isOpen} modal open={isOpen} onOpenChange={toggle}>
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame>
          {children ?? (
            <SheetContents onImagePending={handleImageSelected} />
          )}
        </Sheet.Frame>
      </Sheet>

      {pendingImageUri ? (
        <View
            style={[StyleSheet.absoluteFill, { zIndex: 100_000 }]}
            bg={'$background'}>
          <SafeAreaView style={{ flex: 1 }}>
            <ImageEditor
              useModal={false}
              isVisible
              imageUri={pendingImageUri}
              onEditingCancel={handleEditingCancel}
              onEditingComplete={handleEditingComplete}
            />
          </SafeAreaView>
        </View>
      ) : null}
    </>
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
    onImagePending,
  }: {
    onImagePending: (image: string, source: ImageSource) => void;
  }) => {
    const getImageFromDeviceLibrary = getImageFromDevice(
      openImageLibrary,
      (image: string) => onImagePending(image, 'library'),
    );
    const getImageFromDeviceCamera = getImageFromDevice(
      openCamera,
      (image: string) => onImagePending(image, 'camera'),
    );

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
