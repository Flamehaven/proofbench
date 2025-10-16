import type { Preview } from "@storybook/react";
import React from "react";
import { ProofbenchThemeProvider } from "../src/design-system";

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: { expanded: true },
  },
  decorators: [
    (Story) => (
      <ProofbenchThemeProvider mode="light">
        <Story />
      </ProofbenchThemeProvider>
    ),
  ],
};

export default preview;
