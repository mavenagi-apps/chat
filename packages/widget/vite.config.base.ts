import preact from '@preact/preset-vite';
import path from 'path';
import { loadEnv } from 'vite';
import type { UserConfig } from 'vite';

export const EXPORT_NAME = 'widget';

export function createBaseConfig(mode: string): UserConfig {
  const { VERCEL_PROJECT_PRODUCTION_URL } = loadEnv(
    mode,
    path.resolve(__dirname, '../../'),
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
      outDir: '../../public/js',
      sourcemap: false,
      minify: 'esbuild',
      target: 'es2015',
      emptyOutDir: false,
    },
  };
} 