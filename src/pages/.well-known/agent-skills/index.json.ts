import type { APIRoute } from "astro";

const SITE = import.meta.env.SITE || "https://macarthur.me";

export const GET: APIRoute = () => {
  const index = {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: "blog-content",
        type: "skill-md",
        description:
          "Read blog posts and content from Alex MacArthur's website",
        url: `${SITE}/.well-known/agent-skills/blog-content/SKILL.md`,
        digest:
          "sha256:9d90f2e0520f430cca3b6e949cfa87ad26dfe4e6ab67ed99524f5441374c3dad",
      },
      {
        name: "blog-search",
        type: "skill-md",
        description: "Search blog posts on Alex MacArthur's website",
        url: `${SITE}/.well-known/agent-skills/blog-search/SKILL.md`,
        digest:
          "sha256:c14e604131cb9165e575168f0ca6bb130be1fdbdbc4ebc9ab9232daa980a06da",
      },
      {
        name: "rss-updates",
        type: "skill-md",
        description:
          "Subscribe to updates from Alex MacArthur's website via RSS",
        url: `${SITE}/.well-known/agent-skills/rss-updates/SKILL.md`,
        digest:
          "sha256:94116b1d385690cb2e90276f143821c555a08530c60d988fd2d66172379e17a7",
      },
    ],
  };

  return new Response(JSON.stringify(index, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
