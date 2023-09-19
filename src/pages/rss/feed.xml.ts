import rss from "@astrojs/rss";
import contentService from "../../lib/ContentService";
import sanitizeHtml from "sanitize-html";

const posts = await contentService.getAllPosts();

export const get = () =>
  rss({
    title: "Alex MacArthur's Blog",
    description:
      "I'm Alex MacArthur, a software engineer bossing around computers in made-up languages.",
    site: import.meta.env.SITE,
    items: posts.map((post) => ({
      link: `${import.meta.env.SITE_URL}/posts/${post.slug}`,
      title: post.title,
      pubDate: new Date(post.published_at),
      content: sanitizeHtml(post.html, {
        allowedTags: false,
        allowedAttributes: false,
      }),
    })),
    customData: `<language>en-us</language>`,
  });
