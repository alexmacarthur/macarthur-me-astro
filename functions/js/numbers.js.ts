export const onRequest: PagesFunction = async (context) => {
  return fetch("https://analytics.macarthur.me/js/script.js", context.request);
};
