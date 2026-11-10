import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [
      react({
        babel: {
          plugins: [
            ["@babel/plugin-proposal-decorators", { legacy: true }],
            ["@babel/plugin-proposal-class-properties", { loose: true }],
          ],
        },
      }),
      VitePWA({
        // регистрируем сами (src/core/helper/pwa_update.ts): проверка обновлений
        // по таймеру и при возврате во вкладку, применение — без жёсткой перезагрузки
        registerType: "prompt",
        injectRegister: false,
        includeAssets: [
          "favicon.ico",
          "apple-touch-icon.png",
          "mask-icon.svg",
        ],
        manifest: {
          name: "Colorist calc",
          short_name: "Colorist calc",
          description: "Colorist calc",
          theme_color: "#ffffff",
          icons: [
            {
              src: "/colorist-app/icons/android-chrome-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/colorist-app/icons/android-chrome-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
          screenshots: [
            {
              src: "/colorist-app/icons/screenshot-desktop.png",
              sizes: "1280x720",
              type: "image/png",
              form_factor: "wide",
              label: "Десктопная версия Colorist calc"
            },
            {
              src: "/colorist-app/icons/screenshot-mobile.png",
              sizes: "720x1280",
              type: "image/png",
              form_factor: "narrow",
              label: "Мобильная версия Colorist calc"
            }
          ]
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
          // удалять кэши прошлых версий после активации нового SW
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\.mysite\.com\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24,
                },
              },
            },
          ],
        },
      }),
    ],
    base: isProduction ? '/colorist-app/' : '',
    resolve: {
      dedupe: ["dexie"],
    },
  };
});
