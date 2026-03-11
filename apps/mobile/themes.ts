import { createV5Theme, defaultChildrenThemes } from '@tamagui/config/v5';
import { v5ComponentThemes } from '@tamagui/themes/v5';
import { yellow, yellowDark, red, redDark, green, greenDark } from '@tamagui/colors';

const darkPalette = [
  'hsla(309, 21%, 6%, 1)',
  'hsla(309, 21%, 11%, 1)',
  'hsla(309, 21%, 16%, 1)',
  'hsla(309, 21%, 21%, 1)',
  'hsla(309, 21%, 26%, 1)',
  'hsla(309, 21%, 30%, 1)',
  'hsla(309, 21%, 35%, 1)',
  'hsla(309, 21%, 40%, 1)',
  'hsla(309, 21%, 45%, 1)',
  'hsla(309, 21%, 50%, 1)',
  'hsla(0, 15%, 93%, 1)',
  'hsla(0, 15%, 99%, 1)',
];
const lightPalette = [
  'hsla(309, 21%, 89%, 1)',
  'hsla(309, 21%, 85%, 1)',
  'hsla(309, 21%, 80%, 1)',
  'hsla(309, 21%, 76%, 1)',
  'hsla(309, 21%, 72%, 1)',
  'hsla(309, 21%, 67%, 1)',
  'hsla(309, 21%, 63%, 1)',
  'hsla(309, 21%, 59%, 1)',
  'hsla(309, 21%, 54%, 1)',
  'hsla(309, 21%, 50%, 1)',
  'hsla(0, 15%, 15%, 1)',
  'hsla(0, 15%, 1%, 1)',
];

// Your custom accent color theme
const accentLight = {
  accent1: 'hsla(320, 45%, 39%, 1)',
  accent2: 'hsla(320, 45%, 42%, 1)',
  accent3: 'hsla(320, 45%, 45%, 1)',
  accent4: 'hsla(320, 45%, 48%, 1)',
  accent5: 'hsla(320, 45%, 51%, 1)',
  accent6: 'hsla(320, 45%, 53%, 1)',
  accent7: 'hsla(320, 45%, 56%, 1)',
  accent8: 'hsla(320, 45%, 59%, 1)',
  accent9: 'hsla(320, 45%, 62%, 1)',
  accent10: 'hsla(320, 45%, 65%, 1)',
  accent11: 'hsla(250, 50%, 95%, 1)',
  accent12: 'hsla(250, 50%, 95%, 1)',
};

const accentDark = {
  accent1: 'hsla(320, 45%, 38%, 1)',
  accent2: 'hsla(320, 45%, 40%, 1)',
  accent3: 'hsla(320, 45%, 43%, 1)',
  accent4: 'hsla(320, 45%, 45%, 1)',
  accent5: 'hsla(320, 45%, 48%, 1)',
  accent6: 'hsla(320, 45%, 50%, 1)',
  accent7: 'hsla(320, 45%, 53%, 1)',
  accent8: 'hsla(320, 45%, 55%, 1)',
  accent9: 'hsla(320, 45%, 58%, 1)',
  accent10: 'hsla(320, 45%, 60%, 1)',
  accent11: 'hsla(250, 50%, 90%, 1)',
  accent12: 'hsla(250, 50%, 95%, 1)',
};

const builtThemes = createV5Theme({
  darkPalette,
  lightPalette,
  componentThemes: v5ComponentThemes,
  accent: {
    light: accentLight,
    dark: accentDark,
  },
  childrenThemes: {
    // Include default color themes (blue, red, green, yellow, etc.)
    ...defaultChildrenThemes,

    // Semantic color themes for warnings, errors, and success states
    warning: {
      light: yellow,
      dark: yellowDark,
    },
    error: {
      light: red,
      dark: redDark,
    },
    success: {
      light: green,
      dark: greenDark,
    },
  },
});

export type Themes = typeof builtThemes;

// the process.env conditional here is optional but saves web client-side bundle
// size by leaving out themes JS. tamagui automatically hydrates themes from CSS
// back into JS for you, and the bundler plugins set TAMAGUI_ENVIRONMENT. so
// long as you are using the Vite, Next, Webpack plugins this should just work,
// but if not you can just export builtThemes directly as themes:
export const themes: Themes =
  process.env.TAMAGUI_ENVIRONMENT === 'client' && process.env.NODE_ENV === 'production'
    ? ({} as any)
    : (builtThemes as any);
