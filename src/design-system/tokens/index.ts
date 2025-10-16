import rawTokens from "./tokens.json";

export type ThemeMode = "light" | "dark";

export type TokenDictionary = typeof rawTokens;

export const tokens: TokenDictionary = rawTokens;

export const getToken = <T = unknown>(
  path: string,
  mode: ThemeMode = "light",
): T | undefined => {
  const segments = path.split(".");
  let cursor: any = tokens;

  for (const segment of segments) {
    if (cursor == null) {
      return undefined;
    }
    cursor = cursor[segment];
  }

  if (cursor == null) {
    return undefined;
  }

  if (typeof cursor === "object" && "light" in cursor && mode in cursor) {
    return cursor[mode as keyof typeof cursor] as T;
  }

  return cursor as T;
};

export const themePalette = {
  light: {
    text: tokens.token.color.text.primary.default.light,
    background: tokens.token.color.background.primary.default.light,
  },
  dark: {
    text: tokens.token.color.text.primary.default.dark,
    background: tokens.token.color.background.primary.default.dark,
  },
};
