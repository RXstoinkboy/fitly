import React, { memo, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Sheet, Text, YStack } from '@/components/v2/ui';
import { Info } from '@tamagui/lucide-icons';

const PHOTO_GUIDELINES_SEEN_KEY = 'photo_guidelines_seen';

export const usePhotoGuidelinesSheet = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PHOTO_GUIDELINES_SEEN_KEY).then((seen) => {
      if (!seen) {
        setIsOpen(true);
        AsyncStorage.setItem(PHOTO_GUIDELINES_SEEN_KEY, 'true');
      }
    });
  }, []);

  const toggle = (visible?: boolean) => {
    setIsOpen((prev) => visible ?? !prev);
  };

  return { isOpen, toggle };
};

const SheetContents = memo(() => (
  <YStack width={'100%'} gap={'$2'}>
    <Text size="l" weigth="semiBold">
      Photo guidelines for best results:
    </Text>
    <Text pl={'$2'}>1. Plain background</Text>
    <Text pl={'$2'}>2. Good lightning</Text>
    <Text pl={'$2'}>3. Full body visible</Text>
    <Text pl={'$2'}>4. Wear fitted clothes</Text>
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
  <Sheet forceRemoveScrollEnabled={isOpen} modal open={isOpen} onOpenChange={toggle}>
    <Sheet.Overlay />
    <Sheet.Handle />
    <Sheet.Frame>
      <SheetContents />
    </Sheet.Frame>
  </Sheet>
);

export const PhotoGuidelinesInfoButton = ({ onPress }: { onPress: () => void }) => (
  <Button type="ghost" onPress={onPress} icon={<Info />}>
    Photo guidelines
  </Button>
);
