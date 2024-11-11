import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/linguago-pwa/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*'],
      manifest: {
        name: 'LinguaGo',
        short_name: 'LinguaGo',
        description: 'AI驱动的语言学习助手',
        theme_color: '#ffffff',
        start_url: '/linguago-pwa/',
        id: '/linguago-pwa/',
        scope: '/linguago-pwa/',
        icons: [
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        display: 'standalone',
        background_color: '#ffffff',
        prefer_related_applications: false,
        categories: ['education', 'productivity']
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/freakingryan\.github\.io\/linguago-pwa\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'site-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 72 * 60 * 60 // 3 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      }
    })
  ],
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      }
    },
    sourcemap: true
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    open: true
  },
  preview: {
    port: 4173,
    strictPort: true,
    host: true,
    open: true
  }
})
