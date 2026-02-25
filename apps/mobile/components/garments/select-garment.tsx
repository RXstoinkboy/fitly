import { Plus, Trash } from '@/icons';
import { ScrollView, getToken } from 'tamagui';
import { Button, XStack, YStack, Square, Text, Image } from '@/components/v2/ui';
import { GarmentImage, GarmentType, ImageSource } from '@/state/types';
import { useGarments, useSelectedGarments } from '@/state';
import { useState, useEffect } from 'react';
import { useSelectPhotoSheet } from '../modals';

export const useSelectGarment = () => {
  const garments = useGarments();
  const selectedGarments = useSelectedGarments();
  const selectPhotoSheet = useSelectPhotoSheet();
  const [tempImage, setTempImage] = useState<{ filePath: string; source: ImageSource }>();

  const onImageSelected = (filePath: string, source: ImageSource) => {
    setTempImage({ filePath, source });
  };

  const handleAddGarment = async (
    filePath: string,
    source: ImageSource,
    type: GarmentType,
  ): Promise<void> => {
    const id = await garments.addGarment(filePath, source, type);
    selectedGarments.toggleSelection(id, true);
    selectPhotoSheet.toggle(false);
  };

  useEffect(() => {
    if (!selectPhotoModal.isOpen) {
      setTempImage(undefined);
    }
  }, [selectPhotoSheet.isOpen]);

  return {
    tempImage,
    onImageSelected,
    handleAddGarment,
    selectPhotoSheet,
    selectedGarments,
    garments,
  };
};

type SelectGarmentProps = {
  toggle: (opened?: boolean | undefined) => void;
  selectedGarments: GarmentImage[];
  toggleSelection: (id: string, isSelected?: boolean | undefined) => void;
  removeGarment: (id: string, type: GarmentType) => void;
};

export const SelectGarment = ({
  removeGarment,
  selectedGarments,
  toggle,
  toggleSelection,
}: SelectGarmentProps) => {
  return (
    <XStack width={'100%'} justify={'space-evenly'}>
      <ScrollView horizontal>
        <Button
          asChild
          onPress={() => {
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
  );
};
