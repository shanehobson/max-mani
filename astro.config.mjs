import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// TODO: replace with the real production domain once it's locked in.
const SITE_URL = "https://maxmani.com";

export default defineConfig({
  site: SITE_URL,
  output: "static",
  integrations: [
    tailwind({ applyBaseStyles: false }),
    react(),
    sitemap(),
  ],
  vite: {
    server: {
      proxy: {
        "/api/zaera": {
          target: "https://api.zaera.io",
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/api\/zaera/, ""),
        },
      },
    },
  },
});
