// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

import tailwindcss from '@tailwindcss/vite';

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), sitemap()],
  i18n: {
    locales: ["fr", "en"],
    defaultLocale: "en",
  },
  vite: {
    plugins: [tailwindcss()]
  }
});