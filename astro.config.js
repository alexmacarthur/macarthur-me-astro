import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
// import robotsTxt from "astro-robots-txt";
import prefetch from "@astrojs/prefetch";
import { rehypePicPerf } from "@picperf/rehype";
import { jamComments } from "@jam-comments/astro/config";
import { configDotenv } from "dotenv";
import pagefind from "astro-pagefind";

configDotenv();

// https://astro.build/config
export default defineConfig({
  site: "https://macarthur.me",
  trailingSlash: "never",
  markdown: {
    rehypePlugins: [rehypePicPerf],
  },
  integrations: [
    jamComments({
      domain: process.env.JAM_COMMENTS_DOMAIN,
      apiKey: process.env.JAM_COMMENTS_API_KEY,
      copy: {
        commentPlaceholder: "Markdown is supported!",
      },
    }),
    tailwind(),
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
