import type { FC, ReactNode } from 'react';
import { YStack } from './y-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from './linear-gradient';
import { StyleSheet } from 'react-native';
import { getTokens } from 'tamagui';

type ScreenWrapperProps = {
  children: ReactNode;
  footer?: ReactNode;
};

export const ScreenWrapper: FC<ScreenWrapperProps> = ({ children, footer }) => {
  const tokens = getTokens();

  return (
    <YStack flex={1} position="relative">
      <SafeAreaView style={{ flex: 1, padding: tokens.space['$2'].val }}>
        <LinearGradient
          colors={['$background', '$color2']}
          start={[0.5, 0.5]}
          end={[1, 1]}
          style={StyleSheet.absoluteFill}
        />
        {children}
        {footer}
      </SafeAreaView>
    </YStack>
  );
};
