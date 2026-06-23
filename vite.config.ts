import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: isProduction
      ? [
        react({
          babel: {
            plugins: [
              ["@babel/plugin-proposal-decorators", { legacy: true }],
              ["@babel/plugin-proposal-class-properties", { loose: true }],
            ],
          },
        }),
        VitePWA({
          registerType: "autoUpdate",
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
                src: "/icons/android-chrome-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any maskable",
              },
            ],
          },
          workbox: {
            globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
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
      ]
      : [
        react({
          babel: {
            plugins: [
              ["@babel/plugin-proposal-decorators", { legacy: true }],
              ["@babel/plugin-proposal-class-properties", { loose: true }],
            ],
          },
        }),
      ],
    base: isProduction ? "/colorist-app/" : "",
    resolve: {
      dedupe: ["dexie"],
    },
  };
});
