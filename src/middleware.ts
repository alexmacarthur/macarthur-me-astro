import { defineMiddleware } from "astro:middleware";

const SITE_URL = "https://macarthur.me";

const LINK_HEADERS = [
  `<${SITE_URL}/.well-known/api-catalog>; rel="api-catalog"`,
  `<${SITE_URL}/.well-known/agent-skills/index.json>; rel="service-doc"; type="application/json"`,
  `<${SITE_URL}/.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"`,
  `<${SITE_URL}/rss/feed.xml>; rel="alternate"; type="application/rss+xml"; title="RSS Feed"`,
  `<${SITE_URL}/sitemap-index.xml>; rel="sitemap"; type="application/xml"`,
];

function htmlToMarkdown(html: string): string {
  let md = html;

  md = md.replace(/<script[\s\S]*?<\/script>/gi, "");
  md = md.replace(/<style[\s\S]*?<\/style>/gi, "");
  md = md.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  md = md.replace(/<footer[\s\S]*?<\/footer>/gi, "");
  md = md.replace(/<head[\s\S]*?<\/head>/gi, "");

  const mainMatch = md.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) {
    md = mainMatch[1];
  }

  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n\n");
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n\n");
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n\n");
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "#### $1\n\n");
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "##### $1\n\n");
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "###### $1\n\n");

  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
  md = md.replace(/<(strong|b)>([\s\S]*?)<\/(strong|b)>/gi, "**$2**");
  md = md.replace(/<(em|i)>([\s\S]*?)<\/(em|i)>/gi, "*$2*");

  md = md.replace(
    /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    "\n```\n$1\n```\n",
  );
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");

  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "> $1\n\n");

  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");

  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n");
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<hr\s*\/?>/gi, "\n---\n");

  md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, "![$1]");
  md = md.replace(/<img[^>]*>/gi, "");

  md = md.replace(/<[^>]*>/g, "");

  md = md.replace(/&amp;/g, "&");
  md = md.replace(/&lt;/g, "<");
  md = md.replace(/&gt;/g, ">");
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, " ");

  md = md.replace(/^\s+/gm, "");
  md = md.replace(/\n{3,}/g, "\n\n");
  md = md.trim();

  return md;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const accept = context.request.headers.get("accept") || "";
  const wantsMarkdown =
    accept.includes("text/markdown") && !accept.includes("text/html");

  const response = await next();

  if (response.headers.get("content-type")?.includes("text/html")) {
    if (wantsMarkdown) {
      const html = await response.text();
      const markdown = htmlToMarkdown(html);
      const tokenEstimate = Math.ceil(markdown.length / 4);

      return new Response(markdown, {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "X-Markdown-Tokens": String(tokenEstimate),
          Vary: "Accept",
        },
      });
    }

    const isHomepage =
      context.url.pathname === "/" || context.url.pathname === "";
    if (isHomepage) {
      response.headers.set("Link", LINK_HEADERS.join(", "));
    }

    response.headers.set("Vary", "Accept");
  }

  return response;
});
