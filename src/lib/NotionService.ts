import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { POSTS_PER_PAGE } from "./constants";
import { extractUrl, generateExcerptFromMarkdown } from "./markdown";
import StaticAssetService from "./StaticAssetService";
import type { BlogPost, NotionProperties } from "../types/types";
import DbCacheService from "./DbCacheService";

interface MdBlock {
  type: string;
  parent: string;
  children: MdBlock[];
}

const multiplePostsCache = new DbCacheService(
  "notion_requests__published_posts"
);
const singlePostCache = new DbCacheService("notion_requests__single_posts");

class NotionService {
  client: Client;
  n2m: NotionToMarkdown;
  staticAssetService;

  constructor() {
    this.client = new Client({ auth: import.meta.env.NOTION_TOKEN });
    this.n2m = new NotionToMarkdown({ notionClient: this.client });
    this.staticAssetService = new StaticAssetService();
  }

  async getSingleBlogPost(slug: string): Promise<BlogPost> {
    const cachedData = await singlePostCache.get(slug);

    if (cachedData) return cachedData as any;

    const database = import.meta.env.NOTION_DATABASE_ID ?? "";

    const response = await this.client.databases.query({
      database_id: database,
      page_size: 1,
      filter: {
        property: "Slug",
        rich_text: {
          equals: slug,
        },
      },
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    });

    if (!response.results[0]) {
      throw "Post not found!";
    }

    const page = response.results[0];
    const data = await this.pageToPostTransformer(page);

    await singlePostCache.put(slug, data);

    return data;
  }

  async getPublishedBlogPosts({
    startCursor,
    perPageOverride,
    hydrate = true,
  }: {
    startCursor?: string;
    perPageOverride?: number;
    hydrate?: boolean;
  }): Promise<{
    posts: Partial<BlogPost>[];
    nextCursor: string | null;
    hasMore;
  }> {
    const cacheKey = `${startCursor}__${perPageOverride}__${hydrate}`;
    const cachedData = await multiplePostsCache.get(cacheKey);

    if (cachedData) return cachedData as any;

    const database = import.meta.env.NOTION_DATABASE_ID ?? "";

    const response = await this.client.databases.query({
      database_id: database,
      page_size: perPageOverride || POSTS_PER_PAGE,
      start_cursor: startCursor || undefined,
      filter: {
        property: "Published",
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    });

    const { next_cursor, has_more } = response;
    const posts = await Promise.all(
      response.results.map((res) => {
        // Don't query for all block data. Just get the slug.
        if (!hydrate) {
          return new Promise(async (resolve) => {
            // This is gross... yeah.
            resolve({
              slug: (res as any).properties.Slug.rich_text[0].plain_text,
            });
          });
        }

        return this.pageToPostTransformer(res);
      })
    );

    const data = {
      posts,
      nextCursor: next_cursor,
      hasMore: has_more,
    };

    await multiplePostsCache.put(cacheKey, data);

    return data;
  }

  private async uploadImages(mdBlocks: MdBlock[]): Promise<MdBlock[]> {
    let uploadPromises: Promise<any>[] = [];
    let updatedBlocks = mdBlocks.map((block) => {
      if (block.type === "image") {
        let url = extractUrl(block.parent);

        if (!url) return block;

        let key = this.extractKey(url);

        if (import.meta.env.NODE_ENV === "production") {
          uploadPromises.push(this.staticAssetService.put(url, key));

          block.parent = block.parent.replace(
            /!\[(.*?)\]\((.*)\)/,
            `![$1](/proxy/${key})`
          );
        }
      }

      return block;
    });

    await Promise.all(uploadPromises);

    return updatedBlocks;
  }

  private extractKey(imageUrl: string): string {
    const url = new URL(imageUrl);
    const parts = url.pathname.split("/");

    // The unique ID in the URL of a Notion image URL, right before the file name.
    // Example: a68eaeba-1926-4e41-83db-bc2ea878bc8f
    return parts[parts.length - 2];
  }

  private async getMarkdown(pageId: string) {
    let mdBlocks = (await this.n2m.pageToMarkdown(
      pageId
    )) as unknown as MdBlock[];

    mdBlocks = await this.uploadImages(mdBlocks);

    return this.n2m.toMarkdownString(mdBlocks as any);
  }

  private async pageToPostTransformer(page: any): Promise<BlogPost> {
    let cover = page.cover;

    switch (cover?.type) {
      case "file":
        cover = page.cover.file;
        break;
      case "external":
        cover = page.cover.external.url;
        break;
      default:
        cover = "";
    }

    const properties: NotionProperties = {
      title: {
        property: page.properties.Name,
        type: "title",
      },
      date: {
        property: page.properties.Date,
        type: "date",
      },
      lastUpdated: {
        property: page.properties["Last Updated"],
        type: "date",
      },
      externalUrl: {
        property: page.properties["External URL"],
        type: "rich_text",
      },
      subtitle: {
        property: page.properties["Subtitle"],
        type: "rich_text",
      },
      slug: {
        property: page.properties.Slug,
        type: "rich_text",
      },
    };

    const postProperties = {} as any;

    // @todo This no longer needs to be a set of promises.
    const promises = Object.entries(properties).map(async ([name, value]) => {
      const { property, type } = value;

      return new Promise(async (resolve): Promise<any> => {
        if (property.type === "date") {
          let dateValue = property.date?.start;
          postProperties[name] = dateValue
            ? new Date(`${dateValue}T00:00:00.000-05:00`).toISOString()
            : null;
          return resolve(properties[name]);
        }

        postProperties[name] = property?.[type][0]?.plain_text || null;
        return resolve(postProperties[name]);
      });
    });

    await Promise.all(promises);

    const markdown = await this.getMarkdown(page.id);

    const externalHost = postProperties.externalUrl
      ? new URL(postProperties.externalUrl).hostname
      : null;

    return {
      id: page.id,
      excerpt: "",
      markdown,
      views: "",
      externalHost,
      description: generateExcerptFromMarkdown(markdown),
      openGraphImage: cover,
      prettyDate: this.prettifyDate(postProperties.date),
      prettyLastUpdated: postProperties.lastUpdated
        ? this.prettifyDate(postProperties.lastUpdated)
        : "",
      ...postProperties,
    };
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

export default NotionService;
