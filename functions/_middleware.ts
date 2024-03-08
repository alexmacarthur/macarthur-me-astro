export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();

  response.headers.set(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=43200"
  );

  return response;
};
