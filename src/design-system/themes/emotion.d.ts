import '@emotion/react';
import { M3Theme } from './M3ThemeProvider'; // Import the actual theme interface

declare module '@emotion/react' {
  // Extend the default Theme interface with our M3Theme
  export interface Theme extends M3Theme {}
}