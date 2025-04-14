// @ts-check
import mdx from '@astrojs/mdx';
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { defaultDocFormatConfig } from './src/config';

//
const site = (() => {
  let site = process.env.CANONICAL_URL // must be process.env and not import.meta.env
  if (site == null || site == "") return "http://localhost:4321"
  if (site.startsWith('http://') || site.startsWith('https://')) return site
  return 'https://' + site
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

  //
  integrations: [
    mdx(), 
    sitemap({
      filter: (page) => {
        const { pathname } = new URL(page);
        return !pathname.startsWith('/get') && !pathname.endsWith(defaultDocFormatConfig.name + '/')
      }
    })
  ],

  

  site,

  trailingSlash: "ignore",

  vite: {
    plugins: [tailwindcss()]
  },
});