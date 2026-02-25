import React from 'react';
import { Share, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, XStack, YStack, Button } from '@/components/v2/ui';
import { X, Share2, Trash2 } from '@tamagui/lucide-icons';

type ImageDetailContentProps = {
  imageUri: string;
  isGenerated: boolean;
  onClose: () => void;
  onRemove: () => void;
};

const { width, height } = Dimensions.get('window');

export const ImageDetailContent = ({
  imageUri,
  isGenerated,
  onClose,
  onRemove,
}: ImageDetailContentProps) => {
  const handleShare = async () => {
    try {
      await Share.share({ url: imageUri });
    } catch (_) {}
  };

  const handleRemove = () => {
    onRemove();
    onClose();
  };

  return (
    <YStack flex={1} bg="$color1">
      <SafeAreaView style={{ flex: 1 }}>
        <XStack justify="flex-end" gap="$3" px="$4" py="$2">
          {isGenerated ? (
            <Button
              type="ghost"
              size="$4"
              circular
              icon={<Share2 color="white" size={22} />}
              onPress={handleShare}
            />
          ) : null}
          <Button
            type="ghost"
            size="$4"
            circular
            icon={<Trash2 color="white" size={22} />}
            onPress={handleRemove}
          />
          <Button
            type="ghost"
            size="$4"
            circular
            icon={<X color="white" size={22} />}
            onPress={onClose}
          />
        </XStack>
        <Image
          source={{ uri: imageUri, width, height: height * 0.8 }}
          width={width}
          height={height * 0.8}
          resizeMode="contain"
        />
        {/* TODO: Add expandable bottom sheet with scroll showing the list of garments used to
            generate this image. This will later enable a 'remix' feature where the user can
            pick this generated image and swap individual garments to create variations. */}
      </SafeAreaView>
    </YStack>
  );
};

