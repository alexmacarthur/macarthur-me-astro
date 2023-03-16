import GhostContentAPI from "@tryghost/content-api";
import { JSDOM } from "jsdom";
import type { GhostPost, GhostPostList } from "../types/types";
import { POSTS_PER_PAGE } from "./constants";
import prism from "prismjs";
import loadLanguages from "prismjs/components/index";
import { decode } from "html-entities";
import { isProduction } from "../utils";

loadLanguages();

const api = new GhostContentAPI({
  url: import.meta.env.GHOST_URL,
  key: import.meta.env.GHOST_KEY,
  version: import.meta.env.GHOST_VERSION,
});

const removeHtml = (html: string) => {
  return (
    html
      // Remove HTML.
      .replace(/(<[^>]+>[^<]*<\/[^>]+>)/gi, "")
      // Remove line breaks.
      .replace(/(\n|\r)/gi, "")
      // Add space after colon.
      .replace(/:(?! )/g, ": ")
  );
};

const generateExcerpt = (html: string, wordCount: number = 50) => {
  const dom = new JSDOM(html);
  const text = dom.window.document.body.textContent;

  return removeHtml(text.split(" ").slice(0, wordCount).join(" "));
};

export const computeDescription = (post: GhostPost, wordCount: number = 50) => {
  if (post.meta_description) {
    return post.meta_description;
  }

  if (post.custom_excerpt) {
    return post.custom_excerpt;
  }

  return generateExcerpt(post.html, wordCount);
};

export const isExternal = (post: GhostPost): boolean => {
  return post.tags.some((tag) => tag.slug === "external");
};

export const extractUrlFromBookmark = (html: string): string => {
  const dom = new JSDOM(html);
  const link = dom.window.document.querySelector("a");

  return link.href;
};

export const extractHostFromUrl = (url: string): string => {
  return new URL(url).host;
};

class ContentService {
  getPosts(page: number = 1): Promise<GhostPostList> {
    return api.posts.browse({ page, include: "tags", limit: POSTS_PER_PAGE });
  }

  async getPost(slug: string): Promise<GhostPost> {
    const data = (await api.posts.read({ slug, include: "tags" })) as GhostPost;

    data.html = this.#formatCodeBlocks(data.html);
    data.html = this.#lazyLoadImages(data.html);
    data.html = this.#linkHeadings(data.html);
    data.html = this.#openExternalLinksInNewTab(data.html);
    data.html = this.#proxyImages(data.html);

    return data;
  }

  getAllPosts(): Promise<GhostPostList> {
    return api.posts.browse({ limit: "all", include: "tags" });
  }

  getPage(slug: string): Promise<GhostPost> {
    return api.pages.read({ slug });
  }

  getAllPages(): Promise<GhostPostList> {
    return api.pages.browse({ limit: "all" });
  }

  #proxyImages = (html: string): string => {
    const dom = new JSDOM(html);
    const images = dom.window.document.querySelectorAll("img");

    images.forEach((image) => {
      const src = image.getAttribute("src") || "";

      if (isProduction() && src.startsWith("https://cms.macarthur.me")) {
        const path = new URL(src).pathname;

        image.setAttribute("src", `/proxy-image${path}`);
      }
    });

    return dom.serialize();
  };

  #linkHeadings = (html: string): string => {
    const dom = new JSDOM(html);
    const headings = dom.window.document.querySelectorAll("h2, h3, h4, h5, h6");

    headings.forEach((heading) => {
      heading.innerHTML = `<a class="no-underline" href="#${heading.id}">${heading.innerHTML}</a>`;
    });

    return dom.serialize();
  };

  #lazyLoadImages = (html: string): string => {
    return html.replace(/<(img)(.*\/?>)/g, '<$1 loading="lazy" $2');
  };

  #openExternalLinksInNewTab = (html: string): string => {
    return html.replace(/(<a .*?)>/g, '$1 target="_blank" rel="noopener">');
  };

  #formatCodeBlocks = (html: string): string => {
    return html.replace(
      /(<pre><code class="language-(.*)">)([\s\S]*?)(<\/code><\/pre>)/g,
      (_wrapper, openingTags, language, codeSnippet, closingTags) => {
        const decodedSnippet = decode(codeSnippet);
        const snippet = prism.highlight(
          decodedSnippet,
          prism.languages[language],
          language
        );

        return `${openingTags}${snippet}${closingTags}`.replace(
          /<pre>/,
          '<pre class="code-block">'
        );
      }
    );
  };
}

export default new ContentService();
