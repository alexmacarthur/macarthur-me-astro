import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import image from "@astrojs/image";
import sitemap from "@astrojs/sitemap";
import compress from "astro-compress";
import robotsTxt from "astro-robots-txt";

export default defineConfig({
  site: "https://macarthur.me",
  integrations: [
    tailwind(),
    image(),
    sitemap(),
    robotsTxt({
      policy: [
        { allow: "/", userAgent: "*" },
        { disallow: "/proxy/", userAgent: "*" },
      ],
    }),
    compress({
      css: false,
      html: true,
      img: true,
      js: false,
      svg: true,
    }),
  ],
  markdown: {
    shikiConfig: {
      // Choose from Shiki's built-in themes (or add your own)
      // https://github.com/shikijs/shiki/blob/main/docs/themes.md
      theme: "dracula",
      // Add custom languages
      // Note: Shiki has countless langs built-in, including .astro!
      // https://github.com/shikijs/shiki/blob/main/docs/languages.md
      langs: [],
      // Enable word wrap to prevent horizontal scrolling
      // wrap: true,
    },
  },
});
