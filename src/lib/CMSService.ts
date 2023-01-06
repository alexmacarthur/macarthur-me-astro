import NotionService from "./NotionService";
import chunk from "lodash.chunk";
import { POSTS_PER_PAGE } from "./constants";
import type { BlogPost, ContentEntity } from "../types/types";

class CMS {
  provider: NotionService;

  constructor() {
    this.provider = new NotionService();
  }

  async getTotalPages(): Promise<number> {
    const allPosts = await this.getAllPosts();
    const postChunks = chunk(allPosts, POSTS_PER_PAGE);

    return postChunks.length;
  }

  async getAllPosts(hydrate: boolean = true): Promise<BlogPost[]> {
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

    return posts;
  }

  async getPosts({
    pageNumber,
    propertiesToExclude = [],
  }: {
    pageNumber: number;
    propertiesToExclude?: (keyof ContentEntity)[];
  }): Promise<{
    posts: ContentEntity[];
    hasMore: boolean;
    hasPrevious: boolean;
  }> {
    let allPosts: ContentEntity[] = [];
    let nextCursor;
    let hasMore = false;

    for (let i = 0; i < pageNumber; i++) {
      let {
        posts,
        nextCursor: next_cursor,
        hasMore: has_more,
      } = await this.provider.getPublishedBlogPosts({
        startCursor: nextCursor,
      });

      allPosts = allPosts.concat(posts as BlogPost[]);
      nextCursor = next_cursor;
      hasMore = has_more;

      // Don't bother trying to query the next page if there's nothing there.
      if (!hasMore) {
        break;
      }
    }

    let chunks = chunk(allPosts, POSTS_PER_PAGE);
    let chunkIndex = pageNumber - 1;
    let posts = chunks[chunkIndex] ?? chunks.flat();

    return {
      posts: posts.map((p) => {
        propertiesToExclude.forEach((property) => {
          delete p[property];
        });

        return p;
      }),
      hasMore,
      hasPrevious: pageNumber > 1,
    };
  }

  async getPost(slug: string, propertiesToExclude = []) {
    const post = await this.provider.getSingleBlogPost(slug);

    propertiesToExclude.forEach((property) => {
      delete post[property];
    });

    return post;
  }
}

export default new CMS;
