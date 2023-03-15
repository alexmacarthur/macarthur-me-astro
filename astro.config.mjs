import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import compress from "astro-compress";
import robotsTxt from "astro-robots-txt";
import vercel from '@astrojs/vercel/edge';

// https://astro.build/config
export default defineConfig({
  site: "https://macarthur.me",
  integrations: [tailwind(), sitemap(), robotsTxt({
    policy: [{
      allow: "/",
      userAgent: "*"
    }, {
      disallow: "/proxy-image/",
      userAgent: "*"
    }]
  })],
  markdown: {
    syntaxHighlight: 'prism',
    gfm: true,
  },
  output: "server",
  adapter: vercel()
});
