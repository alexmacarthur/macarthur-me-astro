export const onRequest: PagesFunction = async (context) => {
  return fetch("https://headlights.vercel.app", context.request);
};
