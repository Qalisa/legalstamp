// @ts-check
import mdx from '@astrojs/mdx';
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),

  i18n: {
    defaultLocale: "en",
    locales: ["fr", "en"],
  },
  integrations: [mdx(), sitemap()],

  trailingSlash: "ignore",

  // TODO: fill (https://docs.astro.build/en/guides/integrations-guide/sitemap/)
  vite: {
    plugins: [tailwindcss()]
  },
});