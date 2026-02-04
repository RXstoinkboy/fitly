import { YStack, Text, Button, XStack, Image, Square, ScreenWrapper } from '@/components/v2/ui';
import { SelectPhotoModal, useSelectPhotoModal } from '@/components/modals';
import { GarmentType } from '@/lib/garments/types';
import { memo, useEffect, useState } from 'react';
import { Link, usePathname } from 'expo-router';
import { Plus, Trash } from '@tamagui/lucide-icons';
import {
  ImageSource,
  useGarments,
  useGeneratedImages,
  useModels,
  useOnboarding,
  useSelectedGarments,
} from '@/state';
import { getToken, ScrollView } from 'tamagui';
import { useGenerateImageMutation } from '@/queries/image-generation/mutation';

export default function Onboarding() {
  const pathname = usePathname();
  const { setOnboardingStep } = useOnboarding();
  const { addGarment, removeGarment } = useGarments();
  const { selectedGarments, toggleSelection, clearSelection } = useSelectedGarments();
  const { isOpen, toggle } = useSelectPhotoModal();
  const { addGeneratedImage } = useGeneratedImages();
  const { currentModelId } = useModels();
  const { mutate } = useGenerateImageMutation({
    onSuccess: (data) => {
      if (data && currentModelId) {
        const garmentIds = selectedGarments.map((g) => g.id);
        addGeneratedImage(data.filePath, currentModelId, garmentIds);
      }
    },
    onError: (error) => {
      console.error('Failed to generate image:', error);
    },
  });
  const [tempImage, setTempImage] = useState<{ filePath: string; source: ImageSource }>();

  const isAnyImageSelected = selectedGarments.length > 0;

  const onGenerateImage = () => {
    if (!currentModelId) {
      console.error('No model selected');
      return;
    }

    const topGarment = selectedGarments.find((g) => g.type === 'top');
    const bottomGarment = selectedGarments.find((g) => g.type === 'bottom');

    mutate({
      top: topGarment?.filePath,
      bottom: bottomGarment?.filePath,
    });
    clearSelection();
  };

  const onSuccess = (filePath: string, source: ImageSource) => {
    setTempImage({ filePath, source });
  };

  const onAddGarment = async (
    filePath: string,
    source: ImageSource,
    type: GarmentType,
  ): Promise<void> => {
    const id = await addGarment(filePath, source, type);
    toggleSelection(id, true);
    toggle(false);
  };

  useEffect(() => {
    if (!isOpen) {
      setTempImage(undefined);
    }
  }, [isOpen]);

  useEffect(() => {
    setOnboardingStep(pathname);
  }, []);

  return (
    <ScreenWrapper>
      <YStack flex={1} items={'center'} gap={'$4'}>
        <Text size="xxl" weigth="semiBold" text={'center'}>
          What you&apos;d like to wear?
        </Text>
        <Text type="secondary" text="center">
          Select garments you want to try on
        </Text>

        <XStack width={'100%'} justify={'space-evenly'}>
          <ScrollView horizontal>
            <Button
              asChild
              onPress={() => {
                // setGarmentType(image.type);
                toggle();
              }}>
              <YStack gap={'$2'}>
                <Square
                  height="$12"
                  borderColor={'$borderColor'}
                  bg="$accent12"
                  borderWidth={'$1'}
                  borderStyle="dashed"
                  rounded={'$5'}
                  position="relative"
                  aspectRatio={1}
                  overflow="hidden">
                  <Plus />
                </Square>
                <Text text={'center'}>{'Add something'}</Text>
              </YStack>
            </Button>
            {selectedGarments
              .sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt))
              .map((image) => {
                return (
                  <Button asChild key={image.id}>
                    <YStack gap={'$2'} ml={'$4'}>
                      <Square
                        rounded={'$5'}
                        height={'$12'}
                        position="relative"
                        aspectRatio={1}
                        overflow="hidden">
                        <>
                          <Image
                            source={{
                              uri: image.filePath,
                              width: getToken('$12'),
                              height: getToken('$12'),
                            }}
                            width={'100%'}
                            height={'100%'}
                            rounded={'$7'}
                            aspectRatio={1}
                          />
                          <Button
                            onPress={() => {
                              toggleSelection(image.id, false);
                              removeGarment(image.id, image.type);
                            }}
                            position="absolute"
                            t={'$2'}
                            r={'$2'}
                            circular
                            icon={<Trash />}
                          />
                        </>
                      </Square>
                      <Text text={'center'}>{image.type}</Text>
                    </YStack>
                  </Button>
                );
              })}
          </ScrollView>
        </XStack>
        {/* TODO: or maybe even hide it when there are no clothes added yet */}
        <Link asChild href={'/onboarding/finish'}>
          <Button type="primary" stretched disabled={!isAnyImageSelected} onPress={onGenerateImage}>
            Try this look!
          </Button>
        </Link>
        {/* TODO: move it to some less visible place (same for other steps too) */}
        <Link asChild href={'/onboarding/select-user-photo'}>
          <Button type="ghost">Back</Button>
        </Link>
      </YStack>

      <SelectPhotoModal isOpen={isOpen} toggle={toggle} onSuccess={onSuccess}>
        {tempImage ? <SheetContents image={tempImage} onSuccess={onAddGarment} /> : null}
      </SelectPhotoModal>
    </ScreenWrapper>
  );
}

const SheetContents = memo(
  ({
    image,
    onSuccess,
  }: {
    image: { filePath: string; source: ImageSource };
    onSuccess: (filePath: string, source: ImageSource, type: GarmentType) => Promise<void>;
  }) => {
    const onTop = () => {
      onSuccess(image.filePath, image.source, GarmentType.TOP);
    };
    const onBottom = () => {
      onSuccess(image.filePath, image.source, GarmentType.BOTTOM);
    };

    return (
      <YStack width={'100%'} gap={'$2'}>
        <Text>Pick a garment type</Text>
        <Button onPress={onTop} stretched>
          Top
        </Button>
        <Button onPress={onBottom} stretched>
          Bottom
        </Button>
      </YStack>
    );
  },
);
SheetContents.displayName = 'SheetContents';
