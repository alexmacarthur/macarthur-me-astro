// Core primitive types
type ISODateString = string; // e.g. "2026-04-28T00:52:18.000Z"
type UUID = string;
type JSONString = string; // stringified JSON objects

// ======================
// USER / AUTHOR
// ======================
export interface Author {
  id: string;
  name: string;
  slug: string;
  email: string;
  profile_image: string | null;
  cover_image: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  facebook: string | null;
  twitter: string | null;
  accessibility: string | null; // JSON string
  status: "active" | string;
  meta_title: string | null;
  meta_description: string | null;
  tour: string | null;
  last_seen: ISODateString | null;
  comment_notifications: boolean;
  free_member_signup_notification: boolean;
  paid_subscription_started_notification: boolean;
  paid_subscription_canceled_notification: boolean;
  mention_notifications: boolean;
  milestone_notifications: boolean;
  donation_notifications: boolean;
  recommendation_notifications: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
  locale?: string | null;
  visibility?: string;
  roles?: Role[];
  url: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ======================
// TAG
// ======================
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  feature_image: string | null;
  visibility: "public" | string;
  og_image: string | null;
  og_title: string | null;
  og_description: string | null;
  twitter_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  codeinjection_head: string | null;
  codeinjection_foot: string | null;
  canonical_url: string | null;
  accent_color: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
  url: string;
}

// ======================
// POST REVISION
// ======================
export interface PostRevision {
  id: string;
  post_id: string;
  lexical: JSONString; // Lexical editor JSON
  created_at_ts: number;
  created_at: ISODateString;
  title: string;
  post_status: "draft" | "published" | string;
  reason: string;
  feature_image: string | null;
  feature_image_caption: string | null;
  feature_image_alt: string | null;
  custom_excerpt: string | null;
  author?: Author;
}

// ======================
// TIER (Membership)
// ======================
export interface Tier {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  welcome_page_url: string | null;
  visibility: "public" | "none" | string;
  trial_days: number;
  description: string | null;
  type: "free" | "paid";
  currency: string | null;
  monthly_price: number | null;
  yearly_price: number | null;
  monthly_price_id: string | null;
  yearly_price_id: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ======================
// COUNTS
// ======================
export interface PostCounts {
  clicks: number;
  positive_feedback: number;
  negative_feedback: number;
}

// ======================
// MAIN POST (Current)
// ======================
export interface PostCurrent {
  id: string;
  uuid: UUID;
  title: string;
  slug: string;
  mobiledoc: any | null;
  html: string;
  comment_id: string;
  plaintext: string;
  feature_image: string | null;
  featured: boolean;
  status: "published" | "draft" | string;
  visibility: "public" | string;
  created_at: ISODateString;
  updated_at: ISODateString;
  published_at: ISODateString | null;
  custom_excerpt: string | null;
  codeinjection_head: string | null;
  codeinjection_foot: string | null;
  custom_template: string | null;
  canonical_url: string | null;
  authors: Author[];
  tags: Tag[];
  post_revisions: PostRevision[];
  tiers: Tier[];
  count: PostCounts;
  primary_author: Author;
  primary_tag: Tag;
  email_segment: string;
  url: string;
  excerpt: string;
  reading_time: number;
  og_image: string | null;
  og_title: string | null;
  og_description: string | null;
  twitter_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  email_subject: string | null;
  frontmatter: any | null;
  feature_image_alt: string | null;
  feature_image_caption: string | null;
  email_only: boolean;
}

// ======================
// PREVIOUS STATE
// ======================
export interface PostPrevious {
  status: "draft" | "published" | string;
  updated_at: ISODateString;
  published_at: ISODateString | null;
  tags: Tag[]; // usually empty in the example
}

// ======================
// ROOT WRAPPER
// ======================
export interface PostUpdatePayload {
  post: {
    current: PostCurrent;
    previous: PostPrevious;
  };
}

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const env = context.env as { INDEX_NOW_KEY?: string; SITE_URL?: string };
  const indexNowKey = env.INDEX_NOW_KEY;

  if (!indexNowKey) {
    return new Response("Missing INDEX_NOW_KEY", { status: 500 });
  }

  const payload = (await context.request.json()) as PostUpdatePayload;
  const { current } = payload.post;

  const siteUrl = env.SITE_URL?.replace(/\/$/, "") || "";
  const postUrl = `${siteUrl}/posts/${current.slug}/`;

  if (current.status === "published") {
    console.log(`[IndexNow] Submitting published post: ${postUrl}`);

    const indexNowUrl = `https://api.indexnow.org/indexnow?url=${encodeURIComponent(postUrl)}&key=${indexNowKey}`;
    const response = await fetch(indexNowUrl, { method: "GET" });

    console.log(`[IndexNow] Response for ${postUrl}: ${response.status}`);

    return new Response(JSON.stringify({ url: postUrl }), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(
    `[IndexNow] Skipping non-published post (status: ${current.status}): ${postUrl}`,
  );

  return new Response(
    JSON.stringify({ url: postUrl, skipped: true, status: current.status }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
