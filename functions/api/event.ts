export const onRequest: PagesFunction = async (context) => {
  return fetch("https://analytics.macarthur.me/api/event", context.request);
};
