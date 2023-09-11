import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import compress from "astro-compress";
import robotsTxt from "astro-robots-txt";
import prefetch from "@astrojs/prefetch";
import { rehypePicPerf } from "@picperf/rehype";

export default defineConfig({
  site: "https://macarthur.me",
  trailingSlash: "never",
  markdown: {
    rehypePlugins: [rehypePicPerf],
  },
  integrations: [
    tailwind(),
    sitemap({
      serialize(item) {
        item.changefreq = "daily";
        item.lastmod = new Date();
        item.priority = 0.9;

        return item;
      },
    }),
    robotsTxt({
      policy: [
        {
          allow: "/",
          userAgent: "*",
        },
      ],
    }),
    compress({
      css: false,
      html: true,
      img: true,
      js: false,
      svg: true,
    }),
    prefetch({
      selector: "a[href^='/'], a[href^='https://macarthur.me']",
    }),
  ],
});
