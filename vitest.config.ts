import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    deps: {
      inline: ["vitest-canvas-mock"],
    },
    globals: true,
    include: ["__tests__/**/*.test.{ts,tsx}"],
    setupFiles: ["./__tests__/setup.ts"],
  },
  resolve: {
    alias: {
      "@magi": resolve(__dirname, "./src/packages/"),
      "@": resolve(__dirname, "./"),
      "@test-utils": resolve(__dirname, "./__tests__/utils"),
    },
  },
});
