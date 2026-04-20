import type { APIRoute } from "astro";

const robotsTxt = `
User-agent: *
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=no

Sitemap: ${new URL("sitemap-index.xml", import.meta.env.SITE).href}
Sitemap: https://picperf.io/sitemap/macarthur.me
`.trim();

export const GET: APIRoute = () => {
  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
