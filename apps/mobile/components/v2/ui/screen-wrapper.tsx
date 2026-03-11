import type { FC, ReactNode } from 'react';
import { YStack } from './y-stack';

type ScreenWrapperProps = {
  children: ReactNode;
  footer?: ReactNode;
};

export const ScreenWrapper: FC<ScreenWrapperProps> = ({ children, footer }) => {
  return (
    <YStack flex={1} pb={'$4'} position="relative" bg={'$background'}>
      {/* <LinearGradient colors={['$background', '$color2']} style={StyleSheet.absoluteFill} /> */}
      {children}
      {footer}
    </YStack>
  );
};
