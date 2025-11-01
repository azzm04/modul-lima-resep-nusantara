import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png', 'LOGORN.png'],
      injectRegister: false,
      pwaAssets: {
        disabled: true,
        config: true,
      },
      manifest: {
        name: 'Resep Nusantara',
        short_name: 'Resep Nusantara',
        description: 'Aplikasi Resep Makanan dan Minuman Khas Indonesia',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // Cache API calls
            urlPattern: /^https:\/\/modlima\.fuadfakhruz\.id\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            // Cache images from API
            urlPattern: /^https:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache static assets
            urlPattern: /\.(?:js|css|woff2?|ttf|eot|svg)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module',
      },
    })
  ],
})