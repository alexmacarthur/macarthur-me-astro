export interface NotionProperties {
  title: Property;
  date: Property;
  externalUrl: Property;
  lastUpdated: Property;
  subtitle: Property;
  slug: Property;
}

export type NotionPage = {
  [key in keyof NotionProperties]: any;
} & {
  id: string;
  markdown: string;
  externalHost: string;
};
export interface BlogPost extends NotionPage {
  html: string;
  views?: string;
  prettyDate: string;
  description: string;
  openGraphImage?: string;
  prettyLastUpdated?: string;
}

type PropertyTypes = `title` | `rich_text` | `date`;

type Property = {
  property: any;
  type: PropertyTypes;
};
