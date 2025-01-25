import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import prefetch from "@astrojs/prefetch";
import { rehypePicPerf } from "@picperf/rehype";
import { jamComments } from "@jam-comments/astro/config";
import { configDotenv } from "dotenv";
import pagefind from "astro-pagefind";

configDotenv();

export default defineConfig({
  site: "https://macarthur.me",
  trailingSlash: "never",
  markdown: {
    rehypePlugins: [rehypePicPerf],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    jamComments({
      domain: process.env.JAM_COMMENTS_DOMAIN,
      apiKey: process.env.JAM_COMMENTS_API_KEY,
    }),
    sitemap({
      serialize(item) {
        item.changefreq = "daily";
        item.lastmod = new Date();
        item.priority = 0.9;
        return item;
      },
    }),
    prefetch({
      selector: "a[href^='/'], a[href^='https://macarthur.me']",
    }),
    pagefind(),
  ],
});
