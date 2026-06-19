import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  return new Response("taxation is theft", {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
};
