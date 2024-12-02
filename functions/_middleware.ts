const CACHE_FOREVER_EXTENSIONS = [
  ".css",
  ".js",
  ".woff",
  ".woff2",
  ".ttf",
  ".svg",
  ".eot",
  ".otf",
];

function isCacheableForever(requestUrl: string) {
  return CACHE_FOREVER_EXTENSIONS.some((ext) => requestUrl.endsWith(ext));
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
      "public, s-maxage=3600, stale-while-revalidate=43200",
    );
  }

  if (isCacheableForever(requestUrl)) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536001, immutable",
    );
  }

  return response;
};
