/// <reference types="vitest/config" />
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { playwright } from '@vitest/browser-playwright'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3334,
    proxy: {
      // Framework model routes: /identity/*, /platform/*, /trade/*, etc.
      '/identity': { target: 'http://localhost:3333', changeOrigin: true },
      '/platform': { target: 'http://localhost:3333', changeOrigin: true },
      '/trade': { target: 'http://localhost:3333', changeOrigin: true },
      '/payment': { target: 'http://localhost:3333', changeOrigin: true },
      '/promote': { target: 'http://localhost:3333', changeOrigin: true },
      '/permission': { target: 'http://localhost:3333', changeOrigin: true },
      '/cms': { target: 'http://localhost:3333', changeOrigin: true },
      '/iotbiz': { target: 'http://localhost:3333', changeOrigin: true },
      '/mall': { target: 'http://localhost:3333', changeOrigin: true },
      '/open': { target: 'http://localhost:3333', changeOrigin: true },
    },
  },
  test: {
    silent: 'passed-only',
    unstubEnvs: true,
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    coverage: {
      // include: ['src/**/*.{js,jsx,ts,tsx}'], // Uncomment to expand the report to all src/**/* so untested modules appear as 0% coverage.
      exclude: [
        'src/components/ui/**',
        'src/assets/**',
        'src/tanstack-table.d.ts',
        'src/routeTree.gen.ts',
        'src/test-utils/**',
        'src/routes/**',
      ],
    },
  },
})
