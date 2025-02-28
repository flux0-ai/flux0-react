import { defineConfig } from "vitest/config";

export default defineConfig({
  // TODO https://github.com/hollandjake/mini-rfc6902/issues/13
  define: {
    "process.env": {},
  },
  optimizeDeps: {
    include: ["@vitest/coverage-istanbul", "react", "react-dom/test-utils"],
  },
  test: {
    environment: "node",
    globals: true,
    browser: {
      enabled: true,
      provider: "playwright",
      headless: true,
      instances: [
        {
          name: "chromium",
          browser: "chromium",
        },
      ],
    },
    coverage: {
      provider: "istanbul",
      include: ["src/**"],
      exclude: [
        "**/__tests__",
        "**/*.test.{ts,tsx}",
        "**/*.{story,stories}.tsx",
      ],
    },
  },
});
