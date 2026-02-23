/// <reference types="vitest/config" />
/// <reference types="vite/client" />

import { devtools } from '@tanstack/devtools-vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const enableReactCompiler = process.env.REACT_COMPILER !== 'false';

const plugins = [
  devtools(),
  tanstackRouter({
    target: 'react',
    autoCodeSplitting: true,
  }),
  react(
    enableReactCompiler
      ? {
          babel: {
            plugins: ['babel-plugin-react-compiler'],
          },
        }
      : undefined,
  ),
  tsconfigPaths(),
];

if (process.env.ANALYZE === 'true') {
  plugins.push(
    // @ts-expect-error - rollup-plugin-visualizer is not typed
    visualizer({
      filename: 'dist/stats.html',
      template: 'treemap',
      gzipSize: true,
      brotliSize: true,
    }),
  );
  plugins.push(
    // @ts-expect-error - rollup-plugin-visualizer is not typed
    visualizer({
      filename: 'dist/stats.json',
      template: 'raw-data',
      gzipSize: true,
      brotliSize: true,
    }),
  );
}

export default defineConfig({
  base: './',
  plugins,
  server: {
    port: 3000,
    // proxy to local avatar api providing the images. As soon as the social go-img-kit service provides urls itself, we can safely remove this.
    proxy:
      process.env.NODE_ENV === 'development'
        ? {
            '/local': {
              target: 'http://localhost:8080',
              changeOrigin: true,
            },
          }
        : undefined,
  },
  preview: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/testing/setup-tests.tsx',
    exclude: ['**/node_modules/**'],
    coverage: {
      include: ['src/**'],
    },
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber'],
    exclude: ['fsevents'],
  },
});
