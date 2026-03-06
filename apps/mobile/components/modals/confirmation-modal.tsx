import React, { memo, useState } from 'react';
import { Button, Text, YStack, Sheet } from '@/components/v2/ui';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConfirmationType = 'error' | 'success' | 'neutral';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useConfirmationSheet = () => {
  const [opened, setOpened] = useState(false);

  const toggle = (opened?: boolean) => {
    setOpened((prev) => opened ?? !prev);
  };

  return { isOpen: opened, toggle };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Title = memo(({ children }: { children: React.ReactNode }) => (
  <Text size="l" weigth="bold" text="center">
    {children}
  </Text>
));
Title.displayName = 'ConfirmationSheet.Title';

const Description = memo(({ children }: { children: React.ReactNode }) => (
  <Text size="m" type="secondary" text="center">
    {children}
  </Text>
));
Description.displayName = 'ConfirmationSheet.Description';

const ConfirmButton = memo(
  ({ children, onPress }: { children: React.ReactNode; onPress: () => void }) => {
    return <Button onPress={onPress}>{children}</Button>;
  },
);
ConfirmButton.displayName = 'ConfirmationSheet.ConfirmButton';

const CancelButton = memo(
  ({ children, onPress }: { children: React.ReactNode; onPress: () => void }) => (
    <Button variant="outlined" onPress={onPress}>
      {children}
    </Button>
  ),
);
CancelButton.displayName = 'ConfirmationSheet.CancelButton';

// ─── Root component ───────────────────────────────────────────────────────────

interface ConfirmationSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  toggle: (visible?: boolean) => void;
  type?: ConfirmationType;
}

interface ConfirmationSheetComponent extends React.FC<ConfirmationSheetProps> {
  Title: typeof Title;
  Description: typeof Description;
  ConfirmButton: typeof ConfirmButton;
  CancelButton: typeof CancelButton;
}

const ConfirmationSheetRoot: React.FC<ConfirmationSheetProps> = ({
  children,
  isOpen,
  toggle,
  type = 'neutral',
}) => (
  <Sheet disableRemoveScroll={isOpen} modal open={isOpen} onOpenChange={toggle}>
    <Sheet.Overlay theme={type} />
    <Sheet.Handle theme={type} />
    <Sheet.Frame theme={type}>
      <YStack width="100%" gap="$3">
        {children}
      </YStack>
    </Sheet.Frame>
  </Sheet>
);

export const ConfirmationSheet = ConfirmationSheetRoot as ConfirmationSheetComponent;
ConfirmationSheet.Title = Title;
ConfirmationSheet.Description = Description;
ConfirmationSheet.ConfirmButton = ConfirmButton;
ConfirmationSheet.CancelButton = CancelButton;
