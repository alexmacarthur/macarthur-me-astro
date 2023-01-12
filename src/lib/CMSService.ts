import notionService from "./NotionService";
import markdownService from "./MarkdownService";
import chunk from "lodash.chunk";
import { POSTS_PER_PAGE } from "./constants";
import type { BlogPost } from "../types/types";
import { generateExcerptFromMarkdown } from "./markdown";

class CMS {
  provider;
  markdownService;
  posts: BlogPost[] = [];

  constructor() {
    this.provider = notionService;
    this.markdownService = markdownService;
  }

  async getTotalPages(): Promise<number> {
    const allPosts = await this.getAllPosts();
    const postChunks = chunk(allPosts, POSTS_PER_PAGE);

    return postChunks.length;
  }

  async getAllPosts(): Promise<BlogPost[]> {
    if (this.posts.length) {
      console.log("Using cached posts...");
      return this.posts;
    }

    let posts: BlogPost[] = [];
    let startCursor: any = undefined;
    let hasMore = true;

    while (hasMore) {
      let response = await this.provider.getPublishedBlogPosts({
        startCursor,
        perPageOverride: 100,
      });

      console.log(`Fetched ${response.posts.length} posts...`);

      posts = posts.concat(response.posts as any);
      hasMore = response.hasMore;
      startCursor = response.nextCursor;
    }

    const builtPosts = posts.map<Promise<BlogPost>>(async (p) => {
      return {
        ...p,
        description: generateExcerptFromMarkdown(p.markdown),
        html: await this.markdownService.processMarkdown(p.markdown),
        prettyDate: this.prettifyDate(p.date),
        prettyLastUpdated: p.lastUpdated
          ? this.prettifyDate(p.lastUpdated)
          : "",
      };
    });

    this.posts = await Promise.all(builtPosts);

    return this.posts;
  }

  async getPost(slug: string): Promise<BlogPost | undefined> {
    return (await this.getAllPosts()).find((post) => post.slug === slug);
  }

  private prettifyDate(dateString: string): string {
    const date = new Date(dateString);

    return date.toLocaleString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  }
}

export default new CMS();
