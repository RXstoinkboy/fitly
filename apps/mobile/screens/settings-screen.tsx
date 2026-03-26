import React, { useCallback, useState } from 'react';
import { router } from 'expo-router';
import {
  Image,
  NoImagePlaceholder,
  ScreenWrapper,
  Separator,
  YStack,
  View,
  ListItem,
} from '@/components/v2/ui';
import { ImageUp, MessageCircle, Sparkles } from '@/icons';
import { ImageSource, useModels } from '@/state';
import { openCamera } from '@/utils/open-camera';
import { openImageLibrary } from '@/utils/open-image-library';
import { ScrollView, YGroup } from 'tamagui';
import { ChangeModelSheet } from '@/components/modals';
import { usePaywall } from '@/hooks';
import { analyticsEvents, trackEvent } from '@/lib/analytics';

export const SettingsScreen = () => {
  const { currentModel, addModel, setCurrentModel } = useModels();
  const { openCustomerCenter, isPresenting } = usePaywall();
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
        trackEvent(analyticsEvents.photos.added('model', source), {
          flow: 'app',
          source,
        });
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

  const handleManageSubscription = useCallback(async () => {
    const result = await openCustomerCenter('settings');
    if (!result.opened) {
      console.warn('Subscription management is unavailable right now.');
    }
  }, [openCustomerCenter]);

  return (
    <ScreenWrapper>
      <ScrollView>
        <YStack flex={1} gap="$4" px={'$4'}>
          <YStack position={'relative'} items={'center'}>
            {currentModel ? (
              <View rounded={'$radius.7'} overflow="hidden">
                <Image
                  src={currentModel?.filePath}
                  width={300}
                  height={400}
                  aspectRatio={3 / 4}
                  accessibilityLabel="Current model photo"
                />
              </View>
            ) : (
              <NoImagePlaceholder text="No model selected yet" />
            )}
          </YStack>

          <YGroup
            rounded="$6"
            overflow="hidden"
            borderWidth={1}
            borderColor="$borderColor"
            size="$5"
            bg={'$color3'}>
            <YGroup.Item>
              <ListItem
                bg={'$color3'}
                icon={<ImageUp />}
                title="Change model"
                subTitle="Update the photo you use across the app"
                onPress={() => setIsChangeSheetOpen(true)}
              />
            </YGroup.Item>
            <Separator />
            <YGroup.Item>
              <ListItem
                icon={<Sparkles />}
                bg={'$color3'}
                title="Manage subscriptions"
                subTitle={isPresenting ? 'Opening…' : 'Open RevenueCat Customer Center'}
                onPress={handleManageSubscription}
              />
            </YGroup.Item>
            <Separator />
            <YGroup.Item>
              <ListItem
                bg={'$color3'}
                icon={<MessageCircle />}
                title="Add app suggestion"
                subTitle="Coming soon"
                disabled
              />
            </YGroup.Item>
          </YGroup>
        </YStack>
      </ScrollView>

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
