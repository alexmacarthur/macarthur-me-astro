import type { APIRoute } from "astro";

const SITE = import.meta.env.SITE || "https://macarthur.me";

export const GET: APIRoute = () => {
  const card = {
    $schema:
      "https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/refs/heads/main/schema/2025-03-26/server-card.json",
    serverInfo: {
      name: "macarthur-me",
      version: "1.0.0",
      description:
        "Alex MacArthur's blog — web development articles, tools, and resources",
    },
    transport: {
      type: "streamable-http",
      endpoint: `${SITE}/mcp`,
    },
    capabilities: {
      tools: {
        listChanged: false,
      },
    },
  };

  return new Response(JSON.stringify(card, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
