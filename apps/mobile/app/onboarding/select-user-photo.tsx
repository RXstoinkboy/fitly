import { SelectPhotoModal, useSelectPhotoModal } from '@/components/modals';
import { PhotoGuidelinesInfoButton, PhotoGuidelinesSheet, usePhotoGuidelinesSheet } from '@/components/onboarding';
import { View, YStack, Text, Button, Image, XStack, ScreenWrapper } from '@/components/v2/ui';
import { ImageSource, useModels, useOnboarding } from '@/state';
import { ImageUp } from '@tamagui/lucide-icons';
import { Link, usePathname } from 'expo-router';
import { useEffect } from 'react';

export default function SelectUserPhoto() {
  const { setOnboardingStep } = useOnboarding();
  const pathname = usePathname();

  const { currentModel, addModel, setCurrentModel } = useModels();
  const { isOpen, toggle } = useSelectPhotoModal();
  const { isOpen: isGuidelinesOpen, toggle: toggleGuidelines } = usePhotoGuidelinesSheet();

  const handleAddModel = async (image: string, source: ImageSource): Promise<void> => {
    const id = await addModel(image, source);
    setCurrentModel(id);
    toggle(false);
  };

  useEffect(() => {
    setOnboardingStep(pathname);
  }, []);

  return (
    <ScreenWrapper>
      <YStack flex={1} items={'center'} gap={'$4'}>
        <Text size="xxl" weigth="semiBold">
          Take a photo of yourself
        </Text>
        <Text type="secondary" text="center">
          This photo will be used to try new outfits. Don’t worry, you can change it anytime
        </Text>
        <View position={'relative'}>
          {/* TODO: when no image then show a placeholder */}
          {currentModel ? (
            <Image
              source={{ uri: currentModel?.filePath, width: 300, height: 400 }}
              rounded={'$7'}
              aspectRatio={3 / 4}
            />
          ) : null}

          <Button
            onPress={() => toggle()}
            position="absolute"
            t={10}
            r={10}
            rounded={'$radius.12'}
            icon={<ImageUp />}
          />
        </View>
        {currentModel?.filePath ? (
          <XStack width={'100%'} gap="$2">
            <Link asChild href={'/onboarding/select-garments'}>
              <Button type="primary" flex={1}>
                Go next!
              </Button>
            </Link>
          </XStack>
        ) : (
          <Button
            type="primary"
            stretched
            onPress={() => {
              toggle();
            }}>
            Select photo
          </Button>
        )}

        <PhotoGuidelinesInfoButton onPress={() => toggleGuidelines()} />
      </YStack>
      <SelectPhotoModal isOpen={isOpen} toggle={toggle} onSuccess={handleAddModel} />
      <PhotoGuidelinesSheet isOpen={isGuidelinesOpen} toggle={toggleGuidelines} />
    </ScreenWrapper>
  );
}
