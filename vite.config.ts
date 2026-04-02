/// <reference types="vitest/config" />
/// <reference types="vite/client" />

import { sentryVitePlugin } from '@sentry/vite-plugin';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import type { Plugin } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

function meticulousRecorderPlugin(mode: string, token: string | undefined): Plugin {
  return {
    name: 'meticulous-recorder',
    transformIndexHtml: {
      order: 'pre',
      handler() {
        if (mode === 'production') return;
        if (!token) return;

        return [
          {
            tag: 'script',
            attrs: {
              'data-recording-token': token,
              'data-is-production-environment': 'false',
              src: 'https://snippet.meticulous.ai/v1/meticulous.js',
            },
            injectTo: 'head-prepend' as const,
          },
        ];
      },
    },
  };
}

const enableReactCompiler = process.env.REACT_COMPILER !== 'false';

const plugins = [
  // meticulousRecorderPlugin is added dynamically below via defineConfig callback
  devtools({ injectSource: { enabled: false } }),
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

if (process.env.SENTRY_AUTH_TOKEN) {
  plugins.push(
    sentryVitePlugin({
      org: 'superpowerdotcom',
      project: 'react-app',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      applicationKey: 'superpower-react-app',
      release: { name: process.env.VERCEL_GIT_COMMIT_SHA },
      sourcemaps: {
        filesToDeleteAfterUpload: process.env.VERCEL
          ? ['./.vercel/output/**/*.map']
          : ['./dist/**/*.map'],
      },
      silent: !process.env.CI,
    }),
  );
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    base: './',
    plugins: [meticulousRecorderPlugin(mode, env.VITE_METICULOUS_RECORDING_TOKEN), ...plugins],
    build: { sourcemap: process.env.SENTRY_AUTH_TOKEN ? 'hidden' : false },
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
  };
});
