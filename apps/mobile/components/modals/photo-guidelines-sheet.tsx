import React, { memo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Sheet, Text, YStack, Image, View } from '@/components/v2/ui';
import { Info } from '@/icons';
import { useMount } from '@/hooks';
import { PHOTO_GUIDELINES_SEEN_KEY } from '@/lib/storage-keys';
import { ListItem, YGroup } from 'tamagui';

export const usePhotoGuidelinesSheet = () => {
  const [isOpen, setIsOpen] = useState(false);

  useMount(() => {
    AsyncStorage.getItem(PHOTO_GUIDELINES_SEEN_KEY).then((seen) => {
      if (!seen) {
        setIsOpen(true);
        AsyncStorage.setItem(PHOTO_GUIDELINES_SEEN_KEY, 'true');
      }
    });
  });

  const toggle = (visible?: boolean) => {
    setIsOpen((prev) => visible ?? !prev);
  };

  return { isOpen, toggle };
};

// TODO: Style improvements needed:
// - Title should be bold and larger than the guideline items
// - Guideline items should use regular font weight
// - Consider adding an example stock photo that follows these guidelines
const SheetContents = memo(() => (
  <YStack width={'100%'} gap={'$2'}>
    <Text size="l" weight="semiBold">
      Photo guidelines for best results:
    </Text>
    <View m={'auto'} rounded={'$7'} width={300} height={400} overflow="hidden">
      <Image src={'https://picsum.photos/300/400'} width={300} height={400} aspectRatio={3 / 4} />
    </View>
    <YGroup>
      <YGroup.Item>
        <ListItem>
          <ListItem.Text color={'$color10'}>1. Plain background</ListItem.Text>
        </ListItem>
      </YGroup.Item>
      <YGroup.Item>
        <ListItem>
          <ListItem.Text color={'$color10'}>2. Good lighting</ListItem.Text>
        </ListItem>
      </YGroup.Item>
      <YGroup.Item>
        <ListItem>
          <ListItem.Text color={'$color10'}>3. Full body visible</ListItem.Text>
        </ListItem>
      </YGroup.Item>
      <YGroup.Item>
        <ListItem>
          <ListItem.Text color={'$color10'}>4. Wear fitted clothes</ListItem.Text>
        </ListItem>
      </YGroup.Item>
    </YGroup>
  </YStack>
));
SheetContents.displayName = 'SheetContents';

export const PhotoGuidelinesSheet = ({
  isOpen,
  toggle,
}: {
  isOpen: boolean;
  toggle: (visible?: boolean) => void;
}) => (
  <Sheet disableRemoveScroll={isOpen} modal open={isOpen} onOpenChange={toggle}>
    <Sheet.Overlay />
    <Sheet.Handle />
    <Sheet.Frame>
      <SheetContents />
    </Sheet.Frame>
  </Sheet>
);

export const PhotoGuidelinesInfoButton = ({ onPress }: { onPress: () => void }) => (
  <Button ghost onPress={onPress} icon={<Info />} color={'$color10'} size="xs">
    Photo guidelines
  </Button>
);
