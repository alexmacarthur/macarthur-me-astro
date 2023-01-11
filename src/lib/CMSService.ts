import NotionService from "./NotionService";
import chunk from "lodash.chunk";
import { POSTS_PER_PAGE } from "./constants";
import type { BlogPost, ContentEntity } from "../types/types";

class CMS {
  provider: NotionService;
  posts: BlogPost[] = [];

  constructor() {
    this.provider = new NotionService();
  }

  async getTotalPages(): Promise<number> {
    const allPosts = await this.getAllPosts();
    const postChunks = chunk(allPosts, POSTS_PER_PAGE);

    return postChunks.length;
  }

  async getAllPosts(hydrate: boolean = true): Promise<BlogPost[]> {
    if (this.posts.length) {
      console.log("Using cached posts...");
      return this.posts;
    }

    let posts = [];
    let startCursor: any = undefined;
    let hasMore = true;

    while (hasMore) {
      let response = await this.provider.getPublishedBlogPosts({
        startCursor,
        perPageOverride: 100,
        hydrate,
      });

      console.log(`Fetched ${response.posts.length} posts...`);

      posts = posts.concat(response.posts as any);
      hasMore = response.hasMore;
      startCursor = response.nextCursor;
    }

    this.posts = posts;

    return posts;
  }

  async getPost(slug: string) {
    return (await this.getAllPosts()).find((post) => post.slug === slug);

    // return this.provider.getSingleBlogPost(slug);
  }
}

export default new CMS();
