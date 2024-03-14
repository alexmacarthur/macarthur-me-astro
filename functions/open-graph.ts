export const onRequest: PagesFunction = async (context) => {
  const urlParams = new URL(context.request.url).searchParams.toString();

  return fetch(
    `https://macarthur-me-api.vercel.app/api/og?${urlParams}`,
    context.request
  );
};
