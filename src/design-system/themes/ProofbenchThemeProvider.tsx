import { useMemo } from "react";
import { ThemeProvider, Global, css } from "@emotion/react";
import { tokens, type ThemeMode } from "../tokens";

export interface ProofbenchThemeProviderProps {
  mode?: ThemeMode;
  children: React.ReactNode;
}

const globalStyles = css({
  ":root": {
    colorScheme: "light dark",
    fontFamily: tokens.token.font.family.body.locale.en,
  },
  "*": {
    boxSizing: "border-box",
  },
});

export function ProofbenchThemeProvider({
  mode = "light",
  children,
}: ProofbenchThemeProviderProps): JSX.Element {
  const theme = useMemo(
    () => ({
      mode,
      tokens,
      colors: {
        text: tokens.token.color.text.primary.default[mode],
        background: tokens.token.color.background.primary.default[mode],
      },
      spacing: tokens.token.spacing,
      motion: tokens.token.motion,
      font: tokens.token.font,
    }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <Global styles={globalStyles} />
      {children}
    </ThemeProvider>
  );
}

export type ProofbenchTheme = ReturnType<typeof buildPreviewTheme>;

function buildPreviewTheme(mode: ThemeMode) {
  return {
    mode,
    tokens,
  };
}
