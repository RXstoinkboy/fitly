import React from 'react';
import { Share } from 'react-native';
import { Image, XStack, YStack, Button } from '@/components/v2/ui';
import { Share2, Trash2, ArrowLeft } from '@tamagui/lucide-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ConfirmationSheet, useConfirmationSheet } from '@/components/modals';
import { ButtonProps } from 'tamagui';

type ImageDetailContentProps = {
  imageUri: string;
  isGenerated: boolean;
  onClose: () => void;
  onRemove?: () => void;
  primaryAction?: {
    label: string;
    onPress: () => void;
    icon?: React.ReactNode;
  };
  showDelete?: boolean;
  showShare?: boolean;
};

const MIN_SCALE = 1;
const MAX_SCALE = 2;

export const ImageDetailContent = ({
  imageUri,
  isGenerated,
  onClose,
  onRemove,
  primaryAction,
  showDelete,
  showShare,
}: ImageDetailContentProps) => {
  const confirmation = useConfirmationSheet();

  // ── Zoom / pan shared values ──────────────────────────────────────────────
  const scale = useSharedValue(MIN_SCALE);
  const savedScale = useSharedValue(MIN_SCALE);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const savedOffsetX = useSharedValue(0);
  const savedOffsetY = useSharedValue(0);

  // ── Gestures ──────────────────────────────────────────────────────────────
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > MIN_SCALE) {
        offsetX.value = savedOffsetX.value + e.translationX;
        offsetY.value = savedOffsetY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedOffsetX.value = offsetX.value;
      savedOffsetY.value = offsetY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > MIN_SCALE) {
        scale.value = withSpring(MIN_SCALE);
        savedScale.value = MIN_SCALE;
        offsetX.value = withSpring(0);
        offsetY.value = withSpring(0);
        savedOffsetX.value = 0;
        savedOffsetY.value = 0;
      } else {
        scale.value = withSpring(MAX_SCALE);
        savedScale.value = MAX_SCALE;
      }
    });

  const composedGesture = Gesture.Simultaneous(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: offsetX.value },
      { translateY: offsetY.value },
    ],
  }));

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleShare = async () => {
    try {
      await Share.share({ url: imageUri });
    } catch {}
  };

  const handleRemove = () => {
    if (!onRemove) return;

    onRemove();
    confirmation.toggle(false);
    onClose();
  };

  const shouldShowShare = showShare ?? isGenerated;
  const shouldShowDelete = showDelete ?? Boolean(onRemove);

  return (
    <>
      <YStack flex={1}>
        {/* Zoomable image */}
        <GestureDetector gesture={composedGesture}>
          <Animated.View
            style={[
              {
                flex: 1,
                width: '100%',
              },
              animatedStyle,
            ]}>
            <Image src={imageUri} width="100%" height="100%" objectFit="contain" />
          </Animated.View>
        </GestureDetector>

        {/* Controls */}
        <XStack justify="space-between" px="$4" py="$2" position="absolute" t={0} l={0} r={0}>
          <Button
            height={'$4'}
            width={'$4'}
            rounded={'$12'}
            iconSize={'$4'}
            icon={<ArrowLeft color="white" size={22} />}
            onPress={onClose}
          />
          <XStack justify="flex-end" gap="$3">
            {shouldShowShare ? (
              <Button
                height={'$4'}
                width={'$4'}
                rounded={'$12'}
                iconSize={'$4'}
                icon={<Share2 color="white" size={22} />}
                onPress={handleShare}
              />
            ) : null}
            {shouldShowDelete ? (
              <Button
                height={'$4'}
                width={'$4'}
                rounded={'$12'}
                iconSize={'$4'}
                icon={<Trash2 color="white" size={22} />}
                onPress={() => confirmation.toggle(true)}
              />
            ) : null}
            {primaryAction ? (
              <Button
                height={'$4'}
                width={'$4'}
                rounded={'$12'}
                iconSize={'$4'}
                icon={primaryAction.icon as ButtonProps['icon']}
                onPress={primaryAction.onPress}>
                {primaryAction.label}
              </Button>
            ) : null}
          </XStack>
        </XStack>

        {primaryAction ? <YStack position="absolute" b={20} l={0} r={0} px="$4"></YStack> : null}

        {/* TODO: Add expandable bottom sheet with scroll showing the list of garments used to
              generate this image. This will later enable a 'remix' feature where the user can
              pick this generated image and swap individual garments to create variations. */}
      </YStack>

      {/* Delete confirmation */}
      {shouldShowDelete ? (
        <ConfirmationSheet type="error" isOpen={confirmation.isOpen} toggle={confirmation.toggle}>
          <ConfirmationSheet.Title>Delete this image?</ConfirmationSheet.Title>
          <ConfirmationSheet.Description>
            This action cannot be undone.
          </ConfirmationSheet.Description>
          <ConfirmationSheet.ConfirmButton onPress={handleRemove}>
            Delete
          </ConfirmationSheet.ConfirmButton>
          <ConfirmationSheet.CancelButton onPress={() => confirmation.toggle(false)}>
            Cancel
          </ConfirmationSheet.CancelButton>
        </ConfirmationSheet>
      ) : null}
    </>
  );
};
