/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: './',
  plugins: [react(), viteTsconfigPaths()],
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
    exclude: ['**/node_modules/**', '**/e2e/**'],
    coverage: {
      include: ['src/**'],
    },
  },
  optimizeDeps: { exclude: ['fsevents'] },
});
