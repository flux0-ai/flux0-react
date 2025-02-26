import type { Preview } from "@storybook/react";
import { themes } from "@storybook/theming";
import { initialize, mswLoader } from "msw-storybook-addon";

/*
 * Initializes MSW
 * See https://github.com/mswjs/msw-storybook-addon#configuring-msw
 * to learn how to customize it
 */
initialize();

export const parameters = {
  controls: {
    expanded: true,
  },
  theme: {
    ...themes.dark,
  },
  docs: {
    theme: themes.dark,
  },
};

const preview: Preview = {
  loaders: [mswLoader],
};

export default preview;
