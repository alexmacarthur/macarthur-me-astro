export const onRequest: PagesFunction = async (context) => {
  return fetch("https://macarthur-me-api.vercel.app/api/og", context.request);
};
