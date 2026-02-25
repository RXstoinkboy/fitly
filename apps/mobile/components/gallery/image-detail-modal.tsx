import React from 'react';
import { Modal, Share, Dimensions } from 'react-native';
import { Image, XStack, YStack, Button } from '@/components/v2/ui';
import { X, Share2, Trash2 } from '@tamagui/lucide-icons';

type ImageDetailModalProps = {
  imageUri: string | null;
  isGenerated: boolean;
  onClose: () => void;
  onRemove: (uri: string) => void;
};

const { width, height } = Dimensions.get('window');

export const ImageDetailModal = ({
  imageUri,
  isGenerated,
  onClose,
  onRemove,
}: ImageDetailModalProps) => {
  const handleShare = async () => {
    if (!imageUri) return;
    try {
      await Share.share({ url: imageUri });
    } catch (_) {}
  };

  const handleRemove = () => {
    if (!imageUri) return;
    onRemove(imageUri);
    onClose();
  };

  return (
    <Modal visible={!!imageUri} transparent animationType="fade" onRequestClose={onClose}>
      <YStack flex={1} bg="rgba(0,0,0,0.95)" items="center" justify="center">
        <XStack position="absolute" t={50} r={16} gap="$3" zIndex={10}>
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
        {imageUri ? (
          <Image
            source={{ uri: imageUri, width, height: height * 0.8 }}
            width={width}
            height={height * 0.8}
            resizeMode="contain"
          />
        ) : null}
      </YStack>
    </Modal>
  );
};
