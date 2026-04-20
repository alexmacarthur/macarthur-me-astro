const SITE = "https://macarthur.me";

const TOOLS = [
  {
    name: "search_posts",
    description:
      "Search blog posts on Alex MacArthur's website. Returns matching post titles, URLs, and excerpts.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_latest_posts",
    description:
      "Get the latest blog posts from Alex MacArthur's website. Returns post titles, URLs, and publication dates.",
    inputSchema: {
      type: "object",
      properties: {
        count: {
          type: "number",
          description: "Number of posts to return (default: 10)",
        },
      },
    },
  },
  {
    name: "get_post",
    description:
      "Get a specific blog post by its slug. Returns the post title, content, and metadata.",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "The post slug (e.g., 'promise-with-resolvers')",
        },
      },
      required: ["slug"],
    },
  },
];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function handleRequest(body: Record<string, unknown>): Response {
  const method = body.method as string;
  const id = body.id;

  if (method === "initialize") {
    return jsonResponse({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2025-03-26",
        capabilities: {
          tools: { listChanged: false },
        },
        serverInfo: {
          name: "macarthur-me",
          version: "1.0.0",
        },
      },
    });
  }

  if (method === "tools/list") {
    return jsonResponse({
      jsonrpc: "2.0",
      id,
      result: {
        tools: TOOLS,
      },
    });
  }

  if (method === "tools/call") {
    const toolName = (body.params as Record<string, unknown>)?.name as string;
    const args = ((body.params as Record<string, unknown>)?.arguments ??
      {}) as Record<string, unknown>;

    if (toolName === "get_latest_posts") {
      return jsonResponse({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: `Visit ${SITE}/posts to browse all blog posts, or subscribe to the RSS feed at ${SITE}/rss/feed.xml`,
            },
          ],
        },
      });
    }

    if (toolName === "get_post") {
      const slug = args.slug as string;
      return jsonResponse({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: `Visit ${SITE}/posts/${slug} to read this post. Request with Accept: text/markdown for a markdown version.`,
            },
          ],
        },
      });
    }

    if (toolName === "search_posts") {
      return jsonResponse({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: `Visit ${SITE}/ and use the site search, or browse posts at ${SITE}/posts`,
            },
          ],
        },
      });
    }

    return jsonResponse({
      jsonrpc: "2.0",
      id,
      error: {
        code: -32601,
        message: `Unknown tool: ${toolName}`,
      },
    });
  }

  if (method === "notifications/initialized") {
    return new Response(null, { status: 204 });
  }

  if (method === "ping") {
    return jsonResponse({
      jsonrpc: "2.0",
      id,
      result: {},
    });
  }

  return jsonResponse({
    jsonrpc: "2.0",
    id,
    error: {
      code: -32601,
      message: `Method not found: ${method}`,
    },
  });
}

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (context.request.method !== "POST") {
    return jsonResponse(
      {
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Method not allowed. Use POST for JSON-RPC requests.",
        },
      },
      405,
    );
  }

  try {
    const body = (await context.request.json()) as Record<string, unknown>;
    return handleRequest(body);
  } catch {
    return jsonResponse(
      {
        jsonrpc: "2.0",
        error: {
          code: -32700,
          message: "Parse error: invalid JSON",
        },
      },
      400,
    );
  }
};
