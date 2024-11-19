import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    preact(),
  ],
  build: {
    rollupOptions: {
      input: {
        widget: 'src/main.tsx',
      },
      output: {
        // Universal Module Definition, is a module definition format that aims to be compatible with both CommonJS and AMD
        format: 'umd',
        dir: '../../public/js',
        // output js file to ../../public/js/widget.js
        entryFileNames: 'widget.js',
      },
    },
  },
});
