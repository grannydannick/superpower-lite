/// <reference types="vitest/config" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const plugins = [react(), tsconfigPaths()];

if (process.env.ANALYZE === 'true') {
  plugins.push(
    visualizer({
      filename: 'dist/stats.html',
      template: 'treemap',
      gzipSize: true,
      brotliSize: true,
    }),
  );
  plugins.push(
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
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'three-stdlib',
    ],
    exclude: ['fsevents'],
  },
});
