import '@emotion/react';
import type { TokenDictionary, ThemeMode } from '../tokens';

declare module '@emotion/react' {
  export interface Theme {
    tokens: TokenDictionary;
    mode: ThemeMode;
  }
}
