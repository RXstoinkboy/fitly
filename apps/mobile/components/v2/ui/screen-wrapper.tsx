import type { ReactNode } from 'react';
import { LinearGradient } from '@tamagui/linear-gradient';
import { StyleSheet } from 'react-native';
import { YStack } from './y-stack';
// import { HEADER_HEIGHT } from '@/constants/dimensions';

export const ScreenWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <YStack flex={1} p="$4" position="relative">
      <LinearGradient colors={['$color3', '$accent10']} style={StyleSheet.absoluteFillObject} />
      {children}
    </YStack>
  );
};
