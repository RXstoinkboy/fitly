import React, { useState } from 'react';
import { Popover, Button, Text, YStack } from '@/components/v2/ui';
import { Bug, RotateCcw, Trash2, AlertTriangle } from '@/icons';
import { useResetState } from '@/state';

export const DevMenu = () => {
  const [open, setOpen] = useState(false);
  const { resetOnboarding, resetDataWithoutOnboarding, resetAppData } = useResetState();

  const handleAction = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <Popover open={open} onOpenChange={setOpen} placement="top-start">
      <Popover.Trigger asChild>
        <Button
          size="$3"
          circular
          position="absolute"
          b="$2"
          l="$2"
          z={1000}
          opacity={0.6}
          icon={<Bug size={16} />}
        />
      </Popover.Trigger>
      <Popover.Content p="$2" bg="$color2" borderColor="$color5" borderWidth="$0.25">
        <YStack gap="$1" minW={200}>
          <Button
            size="$3"
            icon={<RotateCcw size={16} />}
            onPress={() => handleAction(resetOnboarding)}>
            <Text fontSize="$3">Reset onboarding</Text>
          </Button>
          <Button
            size="$3"
            icon={<Trash2 size={16} />}
            onPress={() => handleAction(resetDataWithoutOnboarding)}>
            <Text fontSize="$3">Reset local data</Text>
          </Button>
          <Button
            size="$3"
            icon={<AlertTriangle size={16} />}
            onPress={() => handleAction(resetAppData)}>
            <Text fontSize="$3">Factory reset</Text>
          </Button>
        </YStack>
      </Popover.Content>
    </Popover>
  );
};
