const CACHE_FOREVER_CONTENT_TYPES = [
  "application/javascript",
  "font/woff2",
  "image/svg+xml",
  "text/css",
];

function isCacheableForever(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  console.log("contentType", contentType);

  return CACHE_FOREVER_CONTENT_TYPES.some((type) => contentType.includes(type));
}

export const onRequestGet: PagesFunction = async (context) => {
  const response = await context.next();
  const requestUrl = context.request.url;

  if (requestUrl.includes("www.")) {
    return Response.redirect(requestUrl.replace("www.", ""), 301);
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("text/html")) {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=43200"
    );
  }

  if (isCacheableForever(response)) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536001, immutable"
    );
  }

  return response;
};
