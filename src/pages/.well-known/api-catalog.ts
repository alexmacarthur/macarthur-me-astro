import type { APIRoute } from "astro";

const SITE = import.meta.env.SITE || "https://macarthur.me";

export const GET: APIRoute = () => {
  const catalog = {
    linkset: [
      {
        anchor: SITE,
        api: [
          {
            href: `${SITE}/rss/feed.xml`,
            rel: "alternate",
            type: "application/rss+xml",
            title: "RSS Feed",
          },
          {
            href: `${SITE}/sitemap-index.xml`,
            rel: "sitemap",
            type: "application/xml",
            title: "Sitemap",
          },
        ],
        service: [
          {
            href: `${SITE}/.well-known/api-catalog`,
            rel: "service-desc",
            type: "application/linkset+json",
            title: "API Catalog",
          },
        ],
      },
    ],
  };

  return new Response(JSON.stringify(catalog, null, 2), {
    headers: {
      "Content-Type": "application/linkset+json",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
