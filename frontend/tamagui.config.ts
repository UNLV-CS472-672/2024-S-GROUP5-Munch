import { config } from "@tamagui/config/v3";
import { createFont, createTamagui, createTokens } from "tamagui";

const interFont = createFont({
  family: "Inter, Helvetica, Arial, sans-serif",
  size: {
    1: 12,
    2: 14,
    3: 15,
  },
  lineHeight: {
    1: 22,
  },
  weight: {
    1: "300",
    2: "600",
  },
  letterSpacing: {
    1: 0,
    2: -1,
  },
  face: {
    300: { normal: "InterLight", italic: "InterItalic" },
    600: { normal: "InterLight" },
  },
});

const size = {
  0: 0,
  1: 5,
  2: 10,
  3: 15,
  4: 20,
};

export const tokens = createTokens({
  size,
  space: { ...size, "-1": -5, "-2": -10 },
  radius: { 0: 0, 1: 3, 2: 6 },
  zIndex: { 0: 0, 1: 100, 2: 200 },
  color: {
    white: "#fff",
    black: "#000",
    pink: "#ff385c",
  },
});
const tamaguiConfig = createTamagui(config);
type Conf = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}

export default tamaguiConfig;
