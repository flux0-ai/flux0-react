import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: ["../public"],
  // TODO remove this once https://github.com/hollandjake/mini-rfc6902/issues/13
  async viteFinal(config) {
    config.define = { "process.env": {} };
    return config;
  },
};
export default config;
