import type {
  Pagination,
  PostOrPage,
  PostsOrPages,
} from "@tryghost/content-api";

export interface GhostPost {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  html: string;
  comment_id: string;
  feature_image: string;
  featured: boolean;
  visibility: "public" | "members" | "paid";
  created_at: string;
  updated_at: string;
  published_at: string;
  custom_excerpt: string | null;
  codeinjection_head: string | null;
  codeinjection_foot: string | null;
  custom_template: string | null;
  canonical_url: string | null;
  url: string;
  excerpt: string;
  reading_time: number;
  access: boolean;
  comments: boolean;
  tags: { slug: string }[];
  og_image: string | null;
  og_title: string | null;
  og_description: string | null;
  twitter_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  email_subject: string | null;
  frontmatter: Record<string, unknown> | null;
  feature_image_alt: string | null;
  feature_image_caption?: string;
}

export type Views = [string, number];

export interface GhostPostList extends Array<GhostPost> {
  meta: {
    pagination: {
      page: number;
      limit: number;
      pages: number;
      total: number;
      next: number | null;
      prev: number | null;
    };
  };
}

export type GhostTags = "external";

export interface PaginatedList {
  data: PostsOrPages;
  currentPage: number;
  lastPage: number;
  url: {
    prev: string | undefined;
    next: string | undefined;
  };
}

export interface CustomPostOrPage extends PostOrPage {
  html: string;
  published_at: string;
  title: string;
  slug: string;
}

interface CustomBrowseResults<T> extends Array<T> {
  meta: { pagination: Pagination };
}

export interface CustomPostsOrPages
  extends CustomBrowseResults<CustomPostOrPage> {}
