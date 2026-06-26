import { defaultConfig } from '@tamagui/config/v5';
import { animations } from '@tamagui/config/v5-reanimated';
import { createFont, createTamagui } from 'tamagui';
import { themes } from './themes';

const playfairFont = createFont({
  family: 'PlayfairDisplay_400Regular',
  size: {
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    5: 16,
    6: 18,
    7: 20,
    8: 24,
    9: 32,
    10: 48,
    true: 14,
  },
  lineHeight: {
    1: 16,
    2: 18,
    3: 20,
    4: 22,
    5: 24,
    6: 28,
    7: 30,
    8: 34,
    9: 42,
    10: 60,
    true: 22,
  },
  weight: {
    4: '400',
    7: '700',
    true: '400',
  },
  letterSpacing: {
    4: 0,
    8: -0.5,
    true: 0,
  },
  face: {
    400: {
      normal: 'PlayfairDisplay_400Regular',
      italic: 'PlayfairDisplay_400Regular_Italic',
    },
    700: {
      normal: 'PlayfairDisplay_700Bold',
      italic: 'PlayfairDisplay_700Bold_Italic',
    },
  },
});

export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  animations,
  themes,
  fonts: {
    ...defaultConfig.fonts,
    heading: playfairFont,
  },
  settings: {
    ...defaultConfig.settings,
    styleCompat: 'legacy',
    defaultPosition: 'relative',
  },
});

type CustomConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends CustomConfig {}
}

export default tamaguiConfig;
