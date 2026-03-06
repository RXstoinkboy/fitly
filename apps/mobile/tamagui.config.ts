import { defaultConfig } from '@tamagui/config/v5';
import { animations } from '@tamagui/config/v5-reanimated';
import { createTamagui } from 'tamagui';
import { themes } from './themes';

export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  animations,
  themes,
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
