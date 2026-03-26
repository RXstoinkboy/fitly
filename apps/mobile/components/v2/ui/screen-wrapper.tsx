import type { FC, ReactNode } from 'react';
import { YStack } from './y-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from './linear-gradient';
import { StyleSheet } from 'react-native';

type ScreenWrapperProps = {
  children: ReactNode;
  footer?: ReactNode;
};

export const ScreenWrapper: FC<ScreenWrapperProps> = ({ children, footer }) => {
  return (
    <YStack flex={1} position="relative">
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={['$background', '$accent1']}
          start={[0.3, 0.3]}
          end={[1, 1]}
          style={StyleSheet.absoluteFill}
        />
        {children}
        {footer}
      </SafeAreaView>
    </YStack>
  );
};
