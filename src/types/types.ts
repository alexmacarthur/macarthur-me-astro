import type { Pagination, PostOrPage } from "@tryghost/content-api";

export interface PaginatedList {
  data: CustomPostsOrPages;
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
