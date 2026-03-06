import React from 'react';
import { Pressable, Share } from 'react-native';
import { Share2, Trash2 } from '@/icons';
import { Button, Image, View, XStack } from '@/components/v2/ui';
import { GarmentImage } from '@/state/types';
import { ConfirmationSheet, useConfirmationSheet } from '../modals';

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
  const confirmation = useConfirmationSheet();
  const handleShare = async () => {
    try {
      // TODO: add image URL to the message, but I think that in order to do it, I have to upload image to backend!
      await Share.share({ message: 'Check out this outfit!' });
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  };
  // TODO: fix garment previews - garment ids and not added to generate image data

  return (
    <>
      <View
        rounded={'$7'}
        width={'90%'}
        height="100%"
        justify={'center'}
        items={'center'}
        bg="$color6"
        overflow="hidden"
        position="relative">
        <Pressable onPress={onPress} style={{ flex: 1, width: '100%' }}>
          {children}
        </Pressable>

        <Button
          position="absolute"
          t={'$2'}
          r={'$2'}
          circular
          icon={<Trash2 />}
          onPress={() => confirmation.toggle(true)}
        />

        <Button
          position="absolute"
          b={'$2'}
          l={'$2'}
          circular
          icon={<Share2 />}
          onPress={handleShare}
        />

        {/* Garment previews – bottom-right corner */}
        {garments.length > 0 && (
          <XStack position="absolute" b={'$2'} r={'$2'} gap={'$1'}>
            {garments.map((garment) => (
              <Image
                key={garment.id}
                src={garment.filePath}
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

      <ConfirmationSheet type="error" isOpen={confirmation.isOpen} toggle={confirmation.toggle}>
        <ConfirmationSheet.Title>Delete this image?</ConfirmationSheet.Title>
        <ConfirmationSheet.Description>This action cannot be undone.</ConfirmationSheet.Description>
        <ConfirmationSheet.ConfirmButton
          onPress={() => {
            onRemove();
            confirmation.toggle(false);
          }}>
          Delete
        </ConfirmationSheet.ConfirmButton>
        <ConfirmationSheet.CancelButton onPress={() => confirmation.toggle(false)}>
          Cancel
        </ConfirmationSheet.CancelButton>
      </ConfirmationSheet>
    </>
  );
};
