/**
 * Material Design 3 Theme Provider
 * Provides M3 color tokens and theme utilities to all components
 */

import React, { createContext, useContext, useMemo } from 'react';
import { ThemeProvider as EmotionThemeProvider, Global, css } from '@emotion/react';
import { m3LightTheme, m3DarkTheme, semanticColors, elevation, type M3ColorScheme } from '../tokens/m3-colors';

export type ThemeMode = 'light' | 'dark';

export interface M3Theme {
  mode: ThemeMode;
  colors: M3ColorScheme;
  semanticColors: typeof semanticColors;
  elevation: typeof elevation.light | typeof elevation.dark;
  spacing: (multiplier: number) => string;
  borderRadius: {
    none: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  typography: {
    displayLarge: React.CSSProperties;
    displayMedium: React.CSSProperties;
    displaySmall: React.CSSProperties;
    headlineLarge: React.CSSProperties;
    headlineMedium: React.CSSProperties;
    headlineSmall: React.CSSProperties;
    titleLarge: React.CSSProperties;
    titleMedium: React.CSSProperties;
    titleSmall: React.CSSProperties;
    bodyLarge: React.CSSProperties;
    bodyMedium: React.CSSProperties;
    bodySmall: React.CSSProperties;
    labelLarge: React.CSSProperties;
    labelMedium: React.CSSProperties;
    labelSmall: React.CSSProperties;
  };
  transitions: {
    duration: {
      shortest: string;
      shorter: string;
      short: string;
      standard: string;
      complex: string;
      enteringScreen: string;
      leavingScreen: string;
    };
    easing: {
      easeInOut: string;
      easeOut: string;
      easeIn: string;
      sharp: string;
    };
  };
}

const M3ThemeContext = createContext<{
  theme: M3Theme;
  toggleTheme: () => void;
} | null>(null);

/**
 * Material Design 3 typography scale
 * Based on Google Stitch specifications
 */
const createTypography = (mode: ThemeMode): M3Theme['typography'] => ({
  displayLarge: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '57px',
    lineHeight: '64px',
    fontWeight: 400,
    letterSpacing: '-0.25px',
  },
  displayMedium: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '45px',
    lineHeight: '52px',
    fontWeight: 400,
    letterSpacing: '0px',
  },
  displaySmall: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '36px',
    lineHeight: '44px',
    fontWeight: 400,
    letterSpacing: '0px',
  },
  headlineLarge: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '32px',
    lineHeight: '40px',
    fontWeight: 600,
    letterSpacing: '0px',
  },
  headlineMedium: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '28px',
    lineHeight: '36px',
    fontWeight: 600,
    letterSpacing: '0px',
  },
  headlineSmall: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: 600,
    letterSpacing: '0px',
  },
  titleLarge: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '22px',
    lineHeight: '28px',
    fontWeight: 600,
    letterSpacing: '0px',
  },
  titleMedium: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 600,
    letterSpacing: '0.15px',
  },
  titleSmall: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 600,
    letterSpacing: '0.1px',
  },
  bodyLarge: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 400,
    letterSpacing: '0.5px',
  },
  bodyMedium: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 400,
    letterSpacing: '0.25px',
  },
  bodySmall: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 400,
    letterSpacing: '0.4px',
  },
  labelLarge: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 500,
    letterSpacing: '0.1px',
  },
  labelMedium: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
  labelSmall: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
});

/**
 * Material Design 3 spacing system (8px base grid)
 */
const spacing = (multiplier: number): string => `${multiplier * 8}px`;

/**
 * Material Design 3 border radius tokens
 */
const borderRadius = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '28px',
  full: '9999px',
};

/**
 * Material Design 3 transitions
 * Based on Material motion system
 */
const transitions = {
  duration: {
    shortest: '150ms',
    shorter: '200ms',
    short: '250ms',
    standard: '300ms',
    complex: '375ms',
    enteringScreen: '225ms',
    leavingScreen: '195ms',
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

interface M3ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}

export const M3ThemeProvider: React.FC<M3ThemeProviderProps> = ({
  children,
  initialMode = 'dark',
}) => {
  const [mode, setMode] = React.useState<ThemeMode>(initialMode);

  const theme: M3Theme = useMemo(
    () => ({
      mode,
      colors: mode === 'dark' ? m3DarkTheme : m3LightTheme,
      semanticColors,
      elevation: mode === 'dark' ? elevation.dark : elevation.light,
      spacing,
      borderRadius,
      typography: createTypography(mode),
      transitions,
    }),
    [mode]
  );

  const toggleTheme = React.useCallback(() => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }, []);

  const contextValue = useMemo(
    () => ({ theme, toggleTheme }),
    [theme, toggleTheme]
  );

  const globalStyles = css`
    * {
      transition: background-color ${theme.transitions.duration.standard} ${theme.transitions.easing.easeInOut},
                  color ${theme.transitions.duration.standard} ${theme.transitions.easing.easeInOut},
                  border-color ${theme.transitions.duration.standard} ${theme.transitions.easing.easeInOut};
    }

    /* Disable transitions for position/transform to avoid jank */
    *,
    *::before,
    *::after {
      transition-property: background-color, color, border-color, box-shadow, opacity;
    }
  `;

  return (
    <M3ThemeContext.Provider value={contextValue}>
      <EmotionThemeProvider theme={theme}>
        <Global styles={globalStyles} />
        {children}
      </EmotionThemeProvider>
    </M3ThemeContext.Provider>
  );
};

/**
 * Hook to access M3 theme and theme utilities
 */
export const useM3Theme = () => {
  const context = useContext(M3ThemeContext);
  if (!context) {
    throw new Error('useM3Theme must be used within M3ThemeProvider');
  }
  return context;
};

/**
 * Hook to get surface color based on elevation level
 * In dark mode, uses tonal elevation (opacity overlays)
 * In light mode, uses elevation shadows
 */
export const useSurfaceColor = (level: 0 | 1 | 2 | 3 | 4 | 5 = 0): string => {
  const { theme } = useM3Theme();

  if (theme.mode === 'light') {
    return theme.colors.surface;
  }

  // Dark mode tonal elevation
  const baseColor = theme.colors.surface;
  const elevationValue = theme.elevation[`level${level}` as keyof typeof theme.elevation];

  if (level === 0) return baseColor;

  // Apply white overlay with elevation opacity
  const opacity = typeof elevationValue === 'number' ? elevationValue : 0;
  return `color-mix(in srgb, ${baseColor} ${(1 - opacity) * 100}%, white ${opacity * 100}%)`;
};

/**
 * Helper to get LII score color based on value
 */
export const getLIIColor = (score: number): string => {
  if (score > 90) return semanticColors.liiExcellent;
  if (score >= 70) return semanticColors.liiGood;
  if (score >= 50) return semanticColors.liiWarning;
  return semanticColors.liiPoor;
};

/**
 * Helper to get semantic score color based on value
 */
export const getSemanticColor = (score: number): string => {
  if (score > 80) return semanticColors.semanticHigh;
  if (score >= 60) return semanticColors.semanticMedium;
  return semanticColors.semanticLow;
};

/**
 * Helper to get coherence color based on value
 */
export const getCoherenceColor = (score: number): string => {
  if (score > 85) return semanticColors.coherenceHigh;
  if (score >= 70) return semanticColors.coherenceMedium;
  return semanticColors.coherenceLow;
};
