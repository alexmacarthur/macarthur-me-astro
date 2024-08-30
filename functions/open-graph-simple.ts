export const onRequest: PagesFunction = async (context) => {
  const urlParams = new URL(context.request.url).searchParams;

  return fetch(
    `https://macarthur-me-api.vercel.app/api/og-simple?${urlParams.toString()}`,
    context.request,
  );
};
