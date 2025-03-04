// @ts-check
import mdx from '@astrojs/mdx';
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

//
const site = (() => {
  const site = import.meta.env.CANONICAL_URL
  if (site == null || site == "") return "http://localhost:4321"
  return site
})();

console.log("[Info] site is =>", site)

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

  site,

  trailingSlash: "ignore",

  vite: {
    plugins: [tailwindcss()]
  },
});