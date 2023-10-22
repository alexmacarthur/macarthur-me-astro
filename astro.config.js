import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import prefetch from "@astrojs/prefetch";
import { rehypePicPerf } from "@picperf/rehype";

import compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
  site: "https://macarthur.me",
  trailingSlash: "never",
  markdown: {
    rehypePlugins: [rehypePicPerf],
  },
  integrations: [
    tailwind(),
    // sitemap({
    //   serialize(item) {
    //     item.changefreq = "daily";
    //     item.lastmod = new Date();
    //     item.priority = 0.9;
    //     return item;
    //   },
    // }),
    prefetch({
      selector: "a[href^='/'], a[href^='https://macarthur.me']",
    }),
    compress(),
  ],
});
