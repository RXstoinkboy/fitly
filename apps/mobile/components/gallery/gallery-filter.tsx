import React, { useState } from 'react';
import { YStack, Popover } from '@/components/v2/ui';
import { SlidersHorizontal } from '@tamagui/lucide-icons';
import { Button, Text } from '@/components/v2/ui';
import type { GarmentFilter } from './types';

type GalleryFilterProps = {
  filter: GarmentFilter;
  onChange: (filter: GarmentFilter) => void;
};

const FILTER_OPTIONS: { label: string; value: GarmentFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Top', value: 'top' },
  { label: 'Bottom', value: 'bottom' },
];

export const GalleryFilter = ({ filter, onChange }: GalleryFilterProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: GarmentFilter) => {
    onChange(value);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} placement="top-end">
      <Popover.Trigger asChild>
        <Button
          type="primary"
          size="$4"
          circular
          position="absolute"
          bottom="$4"
          right="$4"
          zIndex={10}
          icon={<SlidersHorizontal size={20} />}
        />
      </Popover.Trigger>
      <Popover.Content p="$2" bg="$color2" borderColor="$color5" borderWidth="$0.25">
        <YStack gap="$1">
          {FILTER_OPTIONS.map(({ label, value }) => (
            <Button
              key={value}
              type={filter === value ? 'primary' : 'ghost'}
              size="$3"
              onPress={() => handleSelect(value)}>
              <Text>{label}</Text>
            </Button>
          ))}
        </YStack>
      </Popover.Content>
    </Popover>
  );
};
