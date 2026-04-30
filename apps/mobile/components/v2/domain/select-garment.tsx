import { Trash } from '@/icons';
import {
  ScrollView,
  Button,
  XStack,
  YStack,
  Square,
  Text,
  Image,
  SquareButton,
} from '@/components/v2/ui';
import { GarmentImage, GarmentType, ImageSource } from '@/state/types';
import { useGarments, useSelectedGarments } from '@/state';
import { useState, useEffect } from 'react';
import { useSelectPhotoSheet } from '@/components/modals';
import { analyticsEvents, trackEvent } from '@/lib/analytics';
import { AnalyticsFlow } from '@/lib/analytics/types';

export const useSelectGarment = (flow: AnalyticsFlow = 'app') => {
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

    trackEvent(analyticsEvents.garments.added(type), {
      flow,
      garmentType: type,
      source,
      garmentCount: selectedGarments.selectedIds.length + 1,
    });
  };

  useEffect(() => {
    if (!selectPhotoSheet.isOpen) {
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
  placeholder?: string;
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
        <SquareButton onPress={() => toggle()} />

        {selectedGarments
          .sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt))
          .map((image) => {
            return (
              <YStack key={image.id} gap={'$2'} ml={'$4'}>
                <Square
                  rounded={'$5'}
                  height={'$12'}
                  position="relative"
                  aspectRatio={1}
                  overflow="hidden">
                  <>
                    <Image
                      src={image.filePath}
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
                <Text text={'center'} type="secondary">
                  {image.type}
                </Text>
              </YStack>
            );
          })}
      </ScrollView>
    </XStack>
  );
};
