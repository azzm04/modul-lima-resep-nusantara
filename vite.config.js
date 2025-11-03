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
        
        // ✅ IMPROVED RUNTIME CACHING
        runtimeCaching: [
          // ================================================
          // 1. IMAGES - Cache First (Paling Penting!)
          // ================================================
          {
            urlPattern: ({ request, url }) => {
              // Match semua gambar dari domain API atau CDN
              return (
                request.destination === 'image' ||
                /\.(jpg|jpeg|png|gif|webp|svg|avif|ico)$/i.test(url.pathname)
              );
            },
            handler: 'CacheFirst', // ✅ Cache dulu, baru network
            options: {
              cacheName: 'resep-images-v1',
              expiration: {
                maxEntries: 300, // ✅ Increased dari 200
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 hari
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              // ✅ PLUGIN: Log cache hits
              plugins: [
                {
                  cacheDidUpdate: async ({ cacheName, request }) => {
                    console.log(`✅ Image cached: ${request.url}`);
                  },
                  cachedResponseWillBeUsed: async ({ cacheName, request }) => {
                    console.log(`📦 Image from cache: ${request.url}`);
                    return null; // Let workbox handle
                  },
                }
              ],
            }
          },

          // ================================================
          // 2. API RECIPES - Network First with Cache Fallback
          // ================================================
          {
            urlPattern: /^https:\/\/modlima\.fuadfakhruz\.id\/api\/v1\/recipes\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'recipes-api-v1',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 2, // ✅ 2 jam (lebih pendek untuk data fresh)
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 10,
            }
          },

          // ================================================
          // 3. API REVIEWS - Network First
          // ================================================
          {
            urlPattern: /^https:\/\/modlima\.fuadfakhruz\.id\/api\/v1\/reviews\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'reviews-api-v1',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 30, // ✅ 30 menit (reviews lebih sering update)
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 5,
            }
          },

          // ================================================
          // 4. API CATEGORIES - Stale While Revalidate
          // ================================================
          {
            urlPattern: /^https:\/\/modlima\.fuadfakhruz\.id\/api\/v1\/categories\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'categories-api-v1',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24, // 24 jam
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            }
          },
          {
            urlPattern: /^https?:\/\/.*\.(cloudinary|imgur|unsplash)\..*\.(jpg|jpeg|png|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'external-images-v1',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 60, // ✅ 60 hari untuk external
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            }
          },
          {
            urlPattern: /\.(?:js|css|woff2?|ttf|eot)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources-v1',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 hari
              },
            }
          },

          // ================================================
          // 7. GOOGLE FONTS - Cache First
          // ================================================
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets-v1',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 tahun
              },
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts-v1',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 tahun
              },
            }
          },
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