export const onRequest: PagesFunction = async (context) => {
  const urlParams = new URL(context.request.url).searchParams;

  urlParams.append("v", "2");

  return fetch(
    `https://macarthur-me-api.vercel.app/api/og?${urlParams.toString()}`,
    context.request
  );
};
