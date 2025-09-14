import { createTamagui } from "tamagui";
import { themes } from "./themes";
import { defaultConfig } from "@tamagui/config/v4";

export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  tokens: defaultConfig.tokens, // 👈 re-include tokens explicitly
  themes: {
    ...defaultConfig.themes,
    ...themes, // 👈 your custom themes override / extend
  },
});

export type Conf = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}

export default tamaguiConfig;
