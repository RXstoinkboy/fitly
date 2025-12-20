import type { ReactNode } from 'react';
import { LinearGradient } from '@tamagui/linear-gradient';
import { View } from '.';
import { Dimensions } from 'react-native';
import { useTheme } from 'tamagui';
import { HEADER_HEIGHT } from '@/constants/dimensions';

export const ScreenWrapper = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();

  return (
    <View p={'$4'} height={Dimensions.get('window').height - HEADER_HEIGHT}>
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
