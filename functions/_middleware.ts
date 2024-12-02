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

export async function onRequestGet(context) {
  context.response.headers.set("Content-Security-Policy", "script-src 'self';");
  console.log("HEREEEE");

  if (context.request.url.includes("/jamcomments/")) {
    return fetch(
      context.request.url.replace(
        "https://macarthur.me",
        "https://go.jamcomments.com"
      ),
      context.request
    );
  }

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

  if (isCacheableForever(requestUrl)) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536001, immutable"
    );
  }

  return response;
}
