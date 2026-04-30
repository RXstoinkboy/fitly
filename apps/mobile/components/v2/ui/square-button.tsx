import type { ReactNode } from 'react';
import { Plus } from '@/icons';
import { Square, Text, YStack } from '@/components/v2/ui';

type SquareButtonProps = {
  onPress: () => void;
  icon?: ReactNode;
  label?: string;
};

export const SquareButton = ({
  onPress,
  icon = <Plus />,
  label = 'Add something',
}: SquareButtonProps) => {
  return (
    <YStack gap={'$2'} onPress={onPress}>
      <Square
        height="$12"
        borderColor={'$borderColor'}
        bg="transparent"
        borderWidth={'$1'}
        borderStyle="dashed"
        rounded={'$5'}
        position="relative"
        aspectRatio={1}
        overflow="hidden">
        {icon}
      </Square>
      <Text text={'center'} type="secondary">
        {label}
      </Text>
    </YStack>
  );
};
