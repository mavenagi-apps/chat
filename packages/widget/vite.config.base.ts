import preact from "@preact/preset-vite";
import path from "path";
import { loadEnv } from "vite";
import type { UserConfig } from "vite";
import RootPath from "app-root-path";

const PROJECT_ROOT = RootPath.toString();
export const EXPORT_NAME = "widget";
const DEFAULT_IFRAME_DOMAIN = "chat.onmaven.app";

const generateIframeDomain = (
  env: string,
  generatedDeploymentUrl: string,
  productionUrl: string,
) => {
  const domain = env === "production" ? productionUrl : generatedDeploymentUrl;
  return domain || DEFAULT_IFRAME_DOMAIN;
};

export function createBaseConfig(mode: string): UserConfig {
  const { VERCEL_PROJECT_PRODUCTION_URL, VERCEL_ENV, VERCEL_URL } = loadEnv(
    mode,
    PROJECT_ROOT,
    ["VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_ENV", "VERCEL_URL"],
  );

  const iframeDomain = generateIframeDomain(
    VERCEL_ENV,
    VERCEL_URL,
    VERCEL_PROJECT_PRODUCTION_URL,
  );

  return {
    plugins: [preact()],
    define: {
      __IFRAME_DOMAIN__: JSON.stringify(iframeDomain),
    },
    build: {
      lib: {
        entry: "src/main.tsx",
        name: EXPORT_NAME,
        formats: ["umd"],
        fileName: () => `${EXPORT_NAME}.js`,
      },
      outDir: path.resolve(PROJECT_ROOT, "public/js"),
      sourcemap: false,
      minify: "esbuild",
      target: "es2015",
      emptyOutDir: false,
    },
  };
}
