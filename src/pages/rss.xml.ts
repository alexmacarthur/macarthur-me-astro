import rss from "@astrojs/rss";
import cmsService from "../lib/CMSService";
import sanitizeHtml from "sanitize-html";

const posts = await cmsService.getAllPosts();

export const get = () =>
  rss({
    title: "Alex MacArthur's Blog",
    description: "I'm Alex MacArthur, a web developer in Nashville-ish, TN.",
    site: import.meta.env.SITE,
    items: posts.map((post) => ({
      link: `${import.meta.env.SITE_URL}/posts/${post.slug}`,
      title: post.title,
      pubDate: new Date(post.date),
      content: sanitizeHtml(post.html),
    })),
    customData: `<language>en-us</language>`,
  });
