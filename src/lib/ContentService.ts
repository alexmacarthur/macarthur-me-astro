import GhostContentAPI, { type Params } from "@tryghost/content-api";
import { JSDOM } from "jsdom";
import { POSTS_PER_PAGE } from "./constants";
import prism from "prismjs";
import loadLanguages from "prismjs/components/index";
import type { CustomPostOrPage, CustomPostsOrPages } from "../types/types";
import KvService from "./KvService";
import aiService, { RELATED_POST_PROMPT } from "./AiService";
import { isProduction, randomInRange } from "../utils";

loadLanguages();

const api = new GhostContentAPI({
  url: import.meta.env.GHOST_URL || process.env.GHOST_URL,
  key: import.meta.env.GHOST_KEY || process.env.GHOST_KEY,
  version: import.meta.env.GHOST_VERSION || process.env.GHOST_VERSION,
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

const removeHtmlTags = (html: string) => {
  const dom = new JSDOM(html);
  return dom.window.document.body.textContent;
};

const generateExcerpt = (html: string, wordCount: number = 20) => {
  const text = removeHtmlTags(html);

  return removeHtml(text.split(" ").slice(0, wordCount).join(" "));
};

export const computeDescription = (
  post: CustomPostOrPage,
  wordCount: number = 25,
) => {
  if (post.meta_description) {
    return post.meta_description;
  }

  if (post.custom_excerpt) {
    return post.custom_excerpt;
  }

  return generateExcerpt(post.html, wordCount);
};

export const isExternal = (post: CustomPostOrPage): boolean => {
  if (!post.tags) {
    throw new Error("Post does not have tags!");
  }

  return post.tags.some((tag) => tag.slug === "external");
};

export const extractUrlFromBookmark = (html: string): string => {
  const dom = new JSDOM(html);
  const link = dom.window.document.querySelector("a");

  if (!link) {
    console.error(`Could not find link! HTML: ${html}`);
    return "";
  }

  return link.href;
};

export const extractHostFromUrl = (url: string): string => {
  return new URL(url).host;
};

class ContentService {
  getPosts(
    page: number = 1,
    {
      tags = [],
      excludeTags = [],
    }: {
      tags?: string[];
      excludeTags?: (`scrap` | `skip-rss` | `external` | `remote:${string}`)[];
    } = {},
  ): Promise<CustomPostsOrPages> {
    const args: Params = { page, limit: POSTS_PER_PAGE, include: "tags" };

    if (tags.length) {
      args.filter = `tags:${tags.toString()}`;
    }

    if (excludeTags.length) {
      args.filter = `tags:-${excludeTags.toString()}`;
    }

    return api.posts.browse(args) as Promise<CustomPostsOrPages>;
  }

  async getPost(slug: string): Promise<CustomPostOrPage> {
    const data = await api.posts.read({ slug }, { include: "tags" });

    data.html = this.#formatCodeBlocks(data.html || "");
    data.html = this.#lazyLoadImages(data.html);
    data.html = this.#linkHeadings(data.html);
    data.html = this.#openExternalLinksInNewTab(data.html);
    data.html = this.#proxyImages(data.html, slug);

    return data as CustomPostOrPage;
  }

  async getLatestPost({
    excludeTags = undefined,
  }: {
    excludeTags?: string[];
  }): Promise<CustomPostOrPage> {
    const args: Params = { limit: "1", include: "tags" };

    if (excludeTags) {
      args.filter = `tags:-${excludeTags.toString()}`;
    }

    const result = (await api.posts.browse(
      args,
    )) as unknown as Promise<CustomPostsOrPages>;

    return result[0] as CustomPostOrPage;
  }

  getAllPosts({
    tags = undefined,
    excludeTags = undefined,
  }: {
    tags?: string[];
    excludeTags?: string[];
  } = {}): Promise<CustomPostsOrPages> {
    const args: Params = { limit: "all", include: "tags" };

    if (tags) {
      args.filter = `tags:${tags.toString()}`;
    }

    if (excludeTags) {
      args.filter = `tags:-${excludeTags.toString()}`;
    }

    return api.posts.browse(args) as Promise<CustomPostsOrPages>;
  }

  async getRelatedPosts(post: CustomPostOrPage): Promise<CustomPostOrPage[]> {
    const slugs =
      (await KvService.getByKey(`related_posts:${post.slug}`)) || "";

    const posts = await Promise.all(
      slugs
        .split(",")
        .filter((s) => {
          if (!s) {
            console.error("An empty related post slug is set for:", post.slug);
            return false;
          }

          return true;
        })
        .map((s) => this.getPost(s)),
    );

    return posts.slice(0, 2);
  }

  getTotalWordCount(): Promise<number> {
    const postWordCount = api.posts.browse({ limit: "all" }).then((posts) => {
      return posts.reduce((acc, post) => {
        const text = removeHtmlTags(post.html || "");

        return acc + text.split(" ").length;
      }, 0);
    });

    const pageWordCount = api.pages.browse({ limit: "all" }).then((pages) => {
      return pages.reduce((acc, page) => {
        const text = removeHtmlTags(page.html || "");

        return acc + text.split(" ").length;
      }, 0);
    });

    return Promise.all([postWordCount, pageWordCount]).then(
      ([postCount, pageCount]) => postCount + pageCount,
    );
  }

  getTotalPostCount(): Promise<number> {
    return api.posts
      .browse({ limit: 1 })
      .then((data) => data.meta.pagination.total);
  }

  getPage(slug: string): Promise<CustomPostOrPage> {
    return api.pages.read({ slug }) as Promise<CustomPostOrPage>;
  }

  getAllPages(): Promise<CustomPostsOrPages> {
    return api.pages.browse({ limit: "all" }) as Promise<CustomPostsOrPages>;
  }

  #proxyImages = (html: string, postSlug: string): string => {
    const dom = new JSDOM(html);
    const images = dom.window.document.querySelectorAll("img");

    function transform(value) {
      return `https://picperf.io/${value}?sitemap_path=/posts/${postSlug}`;
    }

    function transformSrcset(value) {
      return value
        .split(",")
        .map((src) => {
          const [url, size] = src.trim().split(" ");

          return `${transform(url)} ${size}`;
        })
        .join(",");
    }

    images.forEach((image) => {
      image.src = transform(image.src);
      image.srcset = "";
      image.sizes = "";
      // image.srcset = transformSrcset(image.srcset);
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
    const dom = new JSDOM(html);
    const images = dom.window.document.querySelectorAll("img");

    images.forEach((image) => {
      image.setAttribute("loading", "lazy");
    });

    return dom.serialize();
  };

  #removeRefQueryParam(link: string): string {
    try {
      const url = new URL(link);
      url.searchParams.delete("ref");
      return url.toString();
    } catch (e) {
      return link;
    }
  }

  #openExternalLinksInNewTab = (html: string): string => {
    const dom = new JSDOM(html);
    const links = dom.window.document.querySelectorAll("a");

    links.forEach((link) => {
      // Remove the ?ref parameter Ghost adds.
      link.setAttribute(
        "href",
        this.#removeRefQueryParam(link.getAttribute("href")),
      );
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener");
    });

    return dom.serialize();
  };

  #formatCodeBlocks = (html: string): string => {
    const dom = new JSDOM(html);
    const codeBlocks = dom.window.document.querySelectorAll("pre code");

    codeBlocks.forEach((block) => {
      const language = (block.classList[0] || "").replace("language-", "");
      block.parentElement?.classList.add("code-block");
      const code = block.textContent;

      const html = prism.highlight(
        code,
        prism.languages[language] || prism.languages.txt,
        language || "txt",
      );

      block.innerHTML = html;

      // Wrapper the entire thing in a wrapper so we can more easily
      // fix a "scroll" label at the bottom of the code block.
      const blockWrapper = dom.window.document.createElement("div");
      blockWrapper.classList.add("code-block-wrapper");
      blockWrapper.appendChild(block.parentElement.cloneNode(true));

      block.parentElement.replaceWith(blockWrapper);
    });

    return dom.serialize();
  };
}

export default new ContentService();
