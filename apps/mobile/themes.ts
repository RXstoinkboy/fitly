import { createV5Theme, defaultChildrenThemes } from '@tamagui/config/v5';
import { v5ComponentThemes } from '@tamagui/themes/v5';
import { yellow, yellowDark, red, redDark, green, greenDark } from '@tamagui/colors';

const darkPalette = [
  'hsla(205, 20%, 8%, 1)',
  'hsla(205, 20%, 12%, 1)',
  'hsla(205, 19%, 17%, 1)',
  'hsla(205, 19%, 21%, 1)',
  'hsla(205, 18%, 25%, 1)',
  'hsla(205, 18%, 31%, 1)',
  'hsla(205, 19%, 37%, 1)',
  'hsla(205, 19%, 43%, 1)',
  'hsla(205, 20%, 49%, 1)',
  'hsla(205, 20%, 55%, 1)',
  'hsla(205, 15%, 85%, 1)',
  'hsla(205, 10%, 95%, 1)',
];
const lightPalette = [
  'hsla(205, 15%, 97%, 1)',
  'hsla(205, 14%, 94%, 1)',
  'hsla(205, 14%, 91%, 1)',
  'hsla(205, 13%, 88%, 1)',
  'hsla(205, 12%, 85%, 1)',
  'hsla(205, 13%, 77%, 1)',
  'hsla(205, 13%, 69%, 1)',
  'hsla(205, 14%, 61%, 1)',
  'hsla(205, 14%, 53%, 1)',
  'hsla(205, 15%, 45%, 1)',
  'hsla(205, 20%, 25%, 1)',
  'hsla(205, 25%, 12%, 1)',
];

// Your custom accent color theme
const accentLight = {
  accent1: 'hsla(195, 60%, 55%, 1)',
  accent2: 'hsla(196, 61%, 54%, 1)',
  accent3: 'hsla(198, 63%, 53%, 1)',
  accent4: 'hsla(199, 64%, 51%, 1)',
  accent5: 'hsla(200, 65%, 50%, 1)',
  accent6: 'hsla(202, 66%, 49%, 1)',
  accent7: 'hsla(204, 67%, 48%, 1)',
  accent8: 'hsla(206, 68%, 47%, 1)',
  accent9: 'hsla(208, 69%, 46%, 1)',
  accent10: 'hsla(210, 70%, 45%, 1)',
  accent11: 'hsla(210, 60%, 20%, 1)',
  accent12: 'hsla(215, 50%, 15%, 1)',
};

const accentDark = {
  accent1: 'hsla(195, 50%, 30%, 1)',
  accent2: 'hsla(196, 51%, 33%, 1)',
  accent3: 'hsla(198, 53%, 35%, 1)',
  accent4: 'hsla(199, 54%, 38%, 1)',
  accent5: 'hsla(200, 55%, 40%, 1)',
  accent6: 'hsla(202, 56%, 43%, 1)',
  accent7: 'hsla(204, 57%, 46%, 1)',
  accent8: 'hsla(206, 58%, 49%, 1)',
  accent9: 'hsla(208, 59%, 52%, 1)',
  accent10: 'hsla(210, 60%, 55%, 1)',
  accent11: 'hsla(210, 50%, 88%, 1)',
  accent12: 'hsla(215, 40%, 95%, 1)',
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
