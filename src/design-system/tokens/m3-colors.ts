/**
 * Material Design 3 Color Tokens
 * Based on Google Stitch Design System
 * Source: https://stitch.withgoogle.com/
 */

export const m3LightTheme = {
  // Primary colors
  primary: '#2563EB',
  onPrimary: '#FFFFFF',
  primaryContainer: '#DBEAFE',
  onPrimaryContainer: '#1E3A8A',

  // Secondary colors
  secondary: '#6366F1',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E0E7FF',
  onSecondaryContainer: '#312E81',

  // Tertiary colors
  tertiary: '#8B5CF6',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#EDE9FE',
  onTertiaryContainer: '#5B21B6',

  // Error colors
  error: '#DC2626',
  onError: '#FFFFFF',
  errorContainer: '#FEE2E2',
  onErrorContainer: '#7F1D1D',

  // Success colors (ProofBench specific)
  success: '#059669',
  onSuccess: '#FFFFFF',
  successContainer: '#D1FAE5',
  onSuccessContainer: '#064E3B',

  // Warning colors (ProofBench specific)
  warning: '#D97706',
  onWarning: '#FFFFFF',
  warningContainer: '#FEF3C7',
  onWarningContainer: '#78350F',

  // Surface colors
  surface: '#FFFFFF',
  onSurface: '#1F2937',
  surfaceVariant: '#F3F4F6',
  onSurfaceVariant: '#6B7280',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F9FAFB',
  surfaceContainer: '#F3F4F6',
  surfaceContainerHigh: '#E5E7EB',
  surfaceContainerHighest: '#D1D5DB',

  // Background colors
  background: '#FAFAFA',
  onBackground: '#1F2937',

  // Outline colors
  outline: '#D1D5DB',
  outlineVariant: '#E5E7EB',

  // Other colors
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#1F2937',
  inverseOnSurface: '#F9FAFB',
  inversePrimary: '#60A5FA',
};

export const m3DarkTheme = {
  // Primary colors (from Stitch)
  primary: '#4C82F7',
  onPrimary: '#002D6B',
  primaryContainer: '#004787',
  onPrimaryContainer: '#D5E3FF',

  // Secondary colors
  secondary: '#818CF8',
  onSecondary: '#312E81',
  secondaryContainer: '#4338CA',
  onSecondaryContainer: '#E0E7FF',

  // Tertiary colors
  tertiary: '#A78BFA',
  onTertiary: '#5B21B6',
  tertiaryContainer: '#6D28D9',
  onTertiaryContainer: '#EDE9FE',

  // Error colors (from Stitch)
  error: '#F2B8B5',
  onError: '#601410',
  errorContainer: '#8C1D18',
  onErrorContainer: '#F9DEDC',

  // Success colors (from Stitch)
  success: '#75E77E',
  onSuccess: '#003A0A',
  successContainer: '#005314',
  onSuccessContainer: '#90FF97',

  // Warning colors
  warning: '#FBBF24',
  onWarning: '#78350F',
  warningContainer: '#B45309',
  onWarningContainer: '#FEF3C7',

  // Surface colors (from Stitch)
  surface: '#1F242A',
  onSurface: '#E2E2E6',
  surfaceVariant: '#41474D',
  onSurfaceVariant: '#C1C7CE',
  surfaceContainerLowest: '#0F141A',
  surfaceContainerLow: '#1B2026',
  surfaceContainer: '#1F242A',
  surfaceContainerHigh: '#2A2E35',
  surfaceContainerHighest: '#353940',

  // Background colors
  background: '#0F141A',
  onBackground: '#E2E2E6',

  // Outline colors (from Stitch)
  outline: '#8B9198',
  outlineVariant: '#41474D',

  // Other colors
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#E2E2E6',
  inverseOnSurface: '#1F242A',
  inversePrimary: '#2563EB',
};

export type M3ColorScheme = typeof m3LightTheme;

export const getColorScheme = (mode: 'light' | 'dark'): M3ColorScheme => {
  return mode === 'dark' ? m3DarkTheme : m3LightTheme;
};

// Elevation (Dark mode uses tonal elevation instead of shadows)
export const elevation = {
  light: {
    level0: 'none',
    level1: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    level2: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    level3: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
    level4: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
    level5: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)',
  },
  dark: {
    // Tonal elevation (overlay white at different opacities)
    level0: 0,
    level1: 0.05,
    level2: 0.08,
    level3: 0.11,
    level4: 0.12,
    level5: 0.14,
  },
};

// ProofBench specific semantic colors
export const semanticColors = {
  // LII Score colors (gradient)
  liiExcellent: '#059669', // > 90
  liiGood: '#10B981', // 70-90
  liiWarning: '#F59E0B', // 50-70
  liiPoor: '#EF4444', // < 50

  // Symbolic verification
  symbolicValid: '#10B981',
  symbolicInvalid: '#EF4444',

  // Semantic evaluation
  semanticHigh: '#3B82F6', // > 80
  semanticMedium: '#8B5CF6', // 60-80
  semanticLow: '#F59E0B', // < 60

  // Coherence
  coherenceHigh: '#059669', // > 85
  coherenceMedium: '#F59E0B', // 70-85
  coherenceLow: '#EF4444', // < 70
};
