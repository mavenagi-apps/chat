import { defineConfig, type LibraryOptions } from "vite";
import { createBaseConfig, EXPORT_NAME } from "./vite.config.base";

export default defineConfig(({ mode }) => {
  const config = createBaseConfig(mode);

  // Override settings for debug build
  config.build = {
    ...config.build,
    lib: {
      ...(config.build!.lib as LibraryOptions),
      fileName: () => `${EXPORT_NAME}.debug.js`,
    },
    minify: false,
    rollupOptions: {
      output: {
        format: "umd",
        indent: "  ",
        compact: false,
      },
    },
  };

  return config;
});
