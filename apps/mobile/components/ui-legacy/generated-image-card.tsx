import React from 'react';
import { Pressable, Share } from 'react-native';
import { Image, View, XStack, getToken } from 'tamagui';
import { Share2, Trash2 } from '@tamagui/lucide-icons';
import { Button } from './button';
import { GarmentImage } from '@/state/types';

type GeneratedImageCardProps = {
  /** The image content (e.g. a Tamagui Image). Tapping it triggers onPress. */
  children: React.ReactNode;
  /** URI of the generated image – used for the share action. */
  imageUri: string;
  /** Garments used to generate this image, shown as small previews. */
  garments: GarmentImage[];
  /** Called when the user taps the remove button. */
  onRemove: () => void;
  /** Called when the user taps the image itself (e.g. open full-screen view). */
  onPress: () => void;
};

/**
 * Card wrapper that overlays action buttons and garment thumbnails on top of
 * the provided image child. The image area is tappable via `onPress`.
 */
export const GeneratedImageCard = ({
  children,
  imageUri,
  garments,
  onRemove,
  onPress,
}: GeneratedImageCardProps) => {
  const handleShare = async () => {
    try {
      await Share.share({ url: imageUri, message: 'Check out this outfit!' });
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  };

  return (
    <View
      rounded={'$7'}
      width={'80%'}
      height="90%"
      justify={'center'}
      items={'center'}
      bg="$color6"
      elevationAndroid={'$6'}
      position="relative">
      {/* Image / children – tappable to open full-screen */}
      <Pressable onPress={onPress} style={{ flex: 1, width: '100%' }}>
        {children}
      </Pressable>

      {/* Remove button – top-right corner */}
      <Button
        position="absolute"
        t={'$2'}
        r={'$2'}
        circular
        size={'$2'}
        themeInverse
        elevation={'$1'}
        icon={<Trash2 size={getToken('$1')} />}
        onPress={onRemove}
      />

      {/* Share button – bottom-left corner */}
      <Button
        position="absolute"
        b={'$2'}
        l={'$2'}
        circular
        size={'$2'}
        themeInverse
        elevation={'$1'}
        icon={<Share2 size={getToken('$1')} />}
        onPress={handleShare}
      />

      {/* Garment previews – bottom-right corner */}
      {garments.length > 0 && (
        <XStack position="absolute" b={'$2'} r={'$2'} gap={'$1'}>
          {garments.map((garment) => (
            <Image
              key={garment.id}
              source={{
                uri: garment.filePath,
                width: getToken('$4'),
                height: getToken('$4'),
              }}
              width={'$4'}
              height={'$4'}
              rounded={'$3'}
              borderWidth={'$0.25'}
              borderColor={'$color1'}
            />
          ))}
        </XStack>
      )}
    </View>
  );
};
