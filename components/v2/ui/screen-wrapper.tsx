import type { ReactNode } from 'react';
import { LinearGradient } from '@tamagui/linear-gradient';
import { View } from '.';
import { Dimensions } from 'react-native';
import { useTheme } from 'tamagui';

export const ScreenWrapper = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();

  return (
    <View p={'$4'} maxH={Dimensions.get('window').height}>
      <LinearGradient
        position="absolute"
        t={0}
        l={0}
        colors={[theme.background.val, theme.accent12.val]}
        width={Dimensions.get('screen').width}
        height={Dimensions.get('screen').height}
      />
      {children}
    </View>
  );
};
