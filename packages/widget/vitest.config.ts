import { defineConfig } from "vitest/config";
import { createBaseConfig, EXPORT_NAME } from "./vite.config.base";

export default defineConfig({
  ...createBaseConfig("test"),
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
  },
});
