const CACHE_FOREVER_CONTENT_TYPES = [
  "application/javascript",
  "font/woff2",
  "image/svg+xml",
  "text/css",
];

function isCacheableForever(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  return CACHE_FOREVER_CONTENT_TYPES.some((type) => contentType.includes(type));
}

export const onRequestGet: PagesFunction = async (context) => {
  const response = await context.next();

  // console.log("URL", context.request.url);

  // if (context.request.url.includes("www.")) {
  //   return Response.redirect(response.url.replace("www.", ""), 301);
  // }

  // const contentType = response.headers.get("content-type") || "";

  // if (contentType.includes("text/html")) {
  //   response.headers.set(
  //     "Cache-Control",
  //     "public, s-maxage=3600, stale-while-revalidate=43200"
  //   );
  // }

  return response;
};
