import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          ['@babel/plugin-proposal-class-properties', { loose: true }],
        ],
      },
    }),
    VitePWA({
      registerType: 'autoUpdate', // Автоматически обновляет сервис-воркер
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'My Awesome App',
        short_name: 'MyApp',
        description: 'My Progressive Web App',
        theme_color: '#ffffff',
        icons: [

          { src: '/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // Настройка стратегии кэширования
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // Кэшируем статику
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.mysite\.com\/.*/i, // Ваше API
            handler: 'NetworkFirst', // Сначала пытаемся взять из сети, если нет — из кэша
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 день
              }
            }
          }
        ]
      }
    })
  ],
  base: '/colorosit-app/',
  resolve: {
    dedupe: ['dexie'],
  },
});
