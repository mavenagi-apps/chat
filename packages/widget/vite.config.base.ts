import preact from '@preact/preset-vite';
import path from 'path';
import { loadEnv } from 'vite';
import type { UserConfig } from 'vite';
import RootPath from 'app-root-path';

const PROJECT_ROOT = RootPath.toString();
export const EXPORT_NAME = 'widget';

export function createBaseConfig(mode: string): UserConfig {
  const { VERCEL_PROJECT_PRODUCTION_URL } = loadEnv(
    mode,
    PROJECT_ROOT,
    'VERCEL_PROJECT_PRODUCTION_URL'
  );

  return {
    plugins: [preact()],
    define: {
      __IFRAME_DOMAIN__: JSON.stringify(
        VERCEL_PROJECT_PRODUCTION_URL || 'chat-v2-test.onmaven.app'
      ),
    },
    build: {
      lib: {
        entry: 'src/main.tsx',
        name: EXPORT_NAME,
        formats: ['umd'],
        fileName: () => `${EXPORT_NAME}.js`,
      },
      outDir: path.resolve(PROJECT_ROOT, 'public/js'),
      sourcemap: false,
      minify: 'esbuild',
      target: 'es2015',
      emptyOutDir: false,
    },
  };
} 