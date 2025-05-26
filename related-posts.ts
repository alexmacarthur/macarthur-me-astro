import aiService from "./src/lib/AiService";
import contentService, { computeDescription } from "./src/lib/ContentService";
import kvService, { type Key } from "./src/lib/KvService";
import type { CustomPostOrPage } from "./src/types/types";

export const RELATED_POST_PROMPT = `You are my personal blog curator. When you are given information about a specific blog post (the "target" post), your task is to identify TWO other blog posts from a list of all posts that the reader is likely to also find interesting. 

I will give you the target blog post information in this format: 

{
  title: string,
  excerpt: string,
  slug: string
}

I will give you the list of all posts in this format:

Array<{
  title: string,
  excerpt: string,
  slug: string
}>

Your response MUST be a comma-separated list of slugs for the posts you've selected. Do not give me anything other than a comma-separated list of slugs. The slugs MUST exist in the list I've provided you. Do not make any slugs up.
`;

const all = Array.from(
  await contentService.getAllPosts({
    excludeTags: ["scrap"],
  }),
);

async function buildRelatedPosts(
  post: CustomPostOrPage,
): Promise<CustomPostOrPage[]> {
  const postMap = all.reduce((acc, item) => {
    acc.set(item.slug, item);

    return acc;
  }, new Map<string, CustomPostOrPage>());

  const consolidatedPostData = all
    .filter((p) => p.slug !== post.slug)
    .map((p) => {
      return {
        title: p.title,
        excerpt: computeDescription(p),
        slug: p.slug,
      };
    });

  const slugs = await aiService.ask(`
      ${RELATED_POST_PROMPT}

      ---
      
      Here is the target post information: 
      
      ${JSON.stringify({
        title: post.title,
        excerpt: computeDescription(post),
        slug: post.slug,
      })}

      ---

      Here is the list of all posts from which I want you to select related posts: 

      ${JSON.stringify(consolidatedPostData)}
    `);

  return slugs
    .split(",")
    .map((slug) => {
      const selectedPost = postMap.get(slug);

      if (!selectedPost) {
        console.error("Could not find post in map:", slug);
      }

      return selectedPost as CustomPostOrPage;
    })
    .filter(Boolean);
}

for (const post of all) {
  const key = `related_posts:${post.slug}` satisfies Key;
  const existingValue = await kvService.getByKey(key);

  if (existingValue) {
    console.log("value already set. skipping:", post.slug);
    continue;
  }

  console.log("setting related posts for:", post.slug);

  const result = await buildRelatedPosts(post);

  console.log("got related posts for:", post.slug);

  const relatedPostSlugs = result.map((s) => s.slug);

  await kvService.update(`related_posts:${post.slug}`, relatedPostSlugs);
}

console.log("Done!");
