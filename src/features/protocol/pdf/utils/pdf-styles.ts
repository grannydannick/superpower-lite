import { StyleSheet } from '@react-pdf/renderer';

import { FONT_FAMILY } from './pdf-fonts';

// ---------------------------------------------------------------------------
// Brand Colors (from tailwind.config.cjs)
// ---------------------------------------------------------------------------

export const colors = {
  vermillion: {
    50: '#FFF6EA',
    100: '#FFEDD5',
    300: '#FED7AA',
    500: '#FDBA74',
    700: '#F7861E',
    900: '#FC5F2B',
  },
  green: {
    50: '#E9F9F3',
    100: '#A7F3D0',
    300: '#00FCA1',
    500: '#11C182',
    700: '#26936B',
  },
  yellow: {
    100: '#F7FF9D',
    300: '#E8FC00',
    500: '#D7DB0E',
    700: '#938700',
  },
  pink: {
    50: '#FBF2F9',
    100: '#FFDDF8',
    300: '#FFBEF1',
    500: '#FF68DE',
    700: '#B90090',
    900: '#84004B',
  },
  zinc: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  },
  white: '#FFFFFF',
  black: '#000000',
} as const;

// ---------------------------------------------------------------------------
// Goal Colors
// ---------------------------------------------------------------------------

export const goalColors = {
  red: '#FF5D4D',
  orange: '#FC5F2B',
  blue: '#74B0FF',
  blue50: '#F4F9FF',
} as const;

/** Goal color palette indexed by goal position. */
export const GOAL_COLOR_VALUES = [
  goalColors.red,
  goalColors.orange,
  goalColors.blue,
] as const;

// ---------------------------------------------------------------------------
// Biomarker Status Colors
// ---------------------------------------------------------------------------

export const biomarkerStatusColors = {
  optimal: { bg: colors.green[50], text: colors.green[700] },
  normal: { bg: colors.green[50], text: colors.green[700] },
  high: { bg: colors.pink[50], text: colors.pink[700] },
  low: { bg: colors.yellow[100], text: colors.yellow[700] },
} as const;

// ---------------------------------------------------------------------------
// Font Sizes (pt)
// ---------------------------------------------------------------------------

export const fontSize = {
  xs: 8,
  sm: 9,
  base: 10,
  md: 11,
  lg: 14,
  xl: 18,
  '2xl': 22,
  '3xl': 28,
} as const;

// ---------------------------------------------------------------------------
// Spacing (pt)
// ---------------------------------------------------------------------------

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

// ---------------------------------------------------------------------------
// Shared StyleSheet
// ---------------------------------------------------------------------------

export const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: FONT_FAMILY,
    fontSize: fontSize.base,
    color: colors.zinc[900],
    backgroundColor: colors.white,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
    lineHeight: 1.5,
  },
  h3: {
    fontFamily: FONT_FAMILY,
    fontWeight: 'bold',
    fontSize: fontSize.xl,
    lineHeight: 1.3,
    marginBottom: spacing[2],
    color: colors.zinc[900],
  },
  section: {
    marginBottom: spacing[3],
  },
});
