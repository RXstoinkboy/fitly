import type { FC, ReactNode } from 'react';
import { LinearGradient } from '@tamagui/linear-gradient';
import { StyleSheet } from 'react-native';
import { YStack } from './y-stack';

type ScreenWrapperProps = {
  children: ReactNode;
  footer?: ReactNode;
};

export const ScreenWrapper: FC<ScreenWrapperProps> = ({ children, footer }) => {
  return (
    <YStack flex={1} p="$4" position="relative">
      <LinearGradient colors={['$color3', '$accent10']} style={StyleSheet.absoluteFillObject} />
      {children}
      {footer}
    </YStack>
  );
};
