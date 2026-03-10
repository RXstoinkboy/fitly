import React, { useCallback, useState } from 'react';
import { router } from 'expo-router';
import { ListItem } from 'tamagui';
import {
  Button,
  Image,
  NoImagePlaceholder,
  ScreenWrapper,
  Separator,
  Sheet,
  Text,
  YStack,
} from '@/components/v2/ui';
import { Camera, ChevronRight, ImageUp, MessageCircle, Sparkles, GalleryHorizontal } from '@/icons';
import { ImageSource, useModels } from '@/state';
import { openCamera } from '@/utils/open-camera';
import { openImageLibrary } from '@/utils/open-image-library';

type ChangeModelSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCamera: () => void;
  onSelectLibrary: () => void;
  onGoToGallery: () => void;
  isLoading: boolean;
};

const ChangeModelSheet = ({
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
          <Button width="100%" icon={<GalleryHorizontal />} onPress={onGoToGallery}>
            Pick from model gallery
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};

export const SettingsScreen = () => {
  const { currentModel, addModel, setCurrentModel } = useModels();
  const [isChangeSheetOpen, setIsChangeSheetOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleSheetChange = useCallback((open: boolean) => setIsChangeSheetOpen(open), []);
  const closeSheet = useCallback(() => setIsChangeSheetOpen(false), []);

  const handleAddModel = useCallback(
    async (picker: () => Promise<string | null>, source: ImageSource) => {
      const image = await picker();
      if (!image) return;

      setIsAdding(true);
      try {
        const id = await addModel(image, source);
        setCurrentModel(id);
        closeSheet();
      } finally {
        setIsAdding(false);
      }
    },
    [addModel, closeSheet, setCurrentModel],
  );

  const handleOpenGallery = useCallback(() => {
    closeSheet();
    router.push('/models-gallery');
  }, [closeSheet]);

  return (
    <ScreenWrapper>
      <YStack flex={1} gap="$4">
        <Text size="xl" weigth="semiBold">
          Settings
        </Text>

        <YStack rounded="$6" overflow="hidden" bg="$color3" height={320}>
          {currentModel ? (
            <Image
              src={currentModel.filePath}
              width="100%"
              height="100%"
              objectFit="cover"
              accessibilityLabel="Current model photo"
            />
          ) : (
            <NoImagePlaceholder text="No model selected yet" />
          )}
        </YStack>

        <YStack bg="$background" rounded="$6" overflow="hidden">
          <ListItem
            icon={<ImageUp />}
            iconAfter={<ChevronRight />}
            title="Change model"
            subTitle="Update the photo you use across the app"
            onPress={() => setIsChangeSheetOpen(true)}
          />
          <Separator />
          <ListItem
            icon={<Sparkles />}
            iconAfter={<ChevronRight />}
            title="Manage subscriptions"
            subTitle="Coming soon"
          />
          <Separator />
          <ListItem
            icon={<MessageCircle />}
            iconAfter={<ChevronRight />}
            title="Add app suggestion"
            subTitle="Coming soon"
          />
        </YStack>
      </YStack>

      <ChangeModelSheet
        isOpen={isChangeSheetOpen}
        onOpenChange={handleSheetChange}
        onSelectCamera={() => handleAddModel(openCamera, 'camera')}
        onSelectLibrary={() => handleAddModel(openImageLibrary, 'library')}
        onGoToGallery={handleOpenGallery}
        isLoading={isAdding}
      />
    </ScreenWrapper>
  );
};
