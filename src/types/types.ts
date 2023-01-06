interface MarkdownLayoutProps<T> {
  pageData: T;
  isPost: boolean;
  commentData?: any | null;
  markdownCode: string;
  views?: string;
}

interface PostListLayoutProps {
  posts: PostData[];
  nextPage: number;
  previousPage: number;
  currentPage: number;
  totalPages: number;
}

export interface ContentEntity {
  title: string;
  subtitle?: string;
  description: string;
  slug: string;
  markdown?: string;
  openGraphImage?: string;
}

export interface BlogPost extends ContentEntity {
  id: string;
  date: string;
  prettyDate: string;
  lastUpdated?: string;
  prettyLastUpdated?: string;
  externalUrl?: string;
  externalHost?: string;
  views?: string;
}

type PropertyTypes = `title` | `rich_text` | `date`;

export interface NotionProperties {
  [k: string]: {
    property: any;
    type: PropertyTypes;
  };
}

interface PaginationProps {
  hasMore: boolean;
  hasPrevious: boolean;
  nextPage: number;
  previousPage: number;
  currentPage: number;
}
