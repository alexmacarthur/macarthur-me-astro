import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { rehypePicPerf } from "@picperf/rehype";
import { jamComments } from "@jam-comments/astro/config";
import { configDotenv } from "dotenv";
import pagefind from "astro-pagefind";

import tailwindcss from "@tailwindcss/vite";

configDotenv();

export default defineConfig({
  site: "https://macarthur.me",
  trailingSlash: "never",
  markdown: { rehypePlugins: [rehypePicPerf] },

  // ClientRouter defaults to prefetchAll: true. That, plus the old
  // @astrojs/prefetch viewport selector on every same-origin link,
  // made Lighthouse treat in-viewport post cards (and their CSS) as
  // critical-path. Opt in only via data-astro-prefetch on primary nav.
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },

  integrations: [
    jamComments({
      domain: process.env.JAM_COMMENTS_DOMAIN,
      apiKey: process.env.JAM_COMMENTS_API_KEY,
      copy: { commentPlaceholder: "Markdown is supported!" },
    }),
    sitemap({
      serialize(item) {
        item.changefreq = "daily";
        item.lastmod = new Date();
        item.priority = 0.9;
        return item;
      },
    }),
    pagefind(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
