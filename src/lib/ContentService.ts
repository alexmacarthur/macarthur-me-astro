import GhostContentAPI from "@tryghost/content-api";
import { JSDOM } from "jsdom";
import type { GhostPost, GhostPostList } from "../types/types";
import { POSTS_PER_PAGE } from "./constants";
import prism from "prismjs";

const api = new GhostContentAPI({
  url: import.meta.env.GHOST_URL,
  key: import.meta.env.GHOST_KEY,
  version: import.meta.env.GHOST_VERSION,
});

export const generateExcerpt = (html: string, wordCount: number = 50) => {
  const dom = new JSDOM(html);
  const text = dom.window.document.body.textContent;

  return text.split(" ").slice(0, wordCount).join(" ");
};

class ContentService {
  getPosts(page: number = 1): Promise<GhostPostList> {
    return api.posts.browse({ page, limit: POSTS_PER_PAGE });
  }

  async getPost(slug: string): Promise<GhostPost> {
    const data = (await api.posts.read({ slug })) as GhostPost;

    data.html = this.#formatCodeBlocks(data.html);

    return data;
  }

  getAllPosts(): Promise<GhostPostList> {
    return api.posts.browse({ limit: "all" });
  }

  #formatCodeBlocks = (html: string): string => {
    const dom = new JSDOM(html);
    const codeBlocks = dom.window.document.querySelectorAll("pre code");

    codeBlocks.forEach((block) => {
      block.parentElement?.classList.add("code-block");
      const code = block.innerHTML;
      const html = prism.highlight(
        code,
        prism.languages.javascript,
        "javascript"
      );

      block.innerHTML = html;
    });

    return dom.serialize();
  };
}

export default new ContentService();
