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

  // if (isCacheableForever(response)) {
  //   response.headers.set(
  //     "Cache-Control",
  //     "public, max-age=31560001, immutable"
  //   );

  //   return response;
  // }

  response.headers.set(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=43200"
  );

  return response;
};
