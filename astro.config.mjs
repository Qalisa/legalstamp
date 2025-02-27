// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from "@astrojs/sitemap";
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  i18n: {
    defaultLocale: "en",
    locales: ["fr", "en"],
  },
  integrations: [mdx(), sitemap()],
  trailingSlash: "ignore", // trailing slash are in reality not handled since middleware will rewrite it, so that href="." always behave expectedly
  // TODO: fill (https://docs.astro.build/en/guides/integrations-guide/sitemap/)
  vite: {
    plugins: [tailwindcss()]
  },
});