/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
  // App-specific design system colors
  app: {
    primary: '#00E6FF',
    primaryDark: '#101426',
    background: '#0A1121',
    surface: '#181F33',
    surfaceLight: '#232B3A',
    border: '#2A3047',
    text: '#fff',
    textSecondary: '#A0A4B8',
    error: '#FF6B6B',
    success: '#4CAF50',
    warning: '#FF9800',
  }
};
