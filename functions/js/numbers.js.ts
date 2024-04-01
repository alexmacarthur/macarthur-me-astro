export const onRequest: PagesFunction = async (context) => {
  return fetch(
    "https://analytics.macarthur.me/js/plausible.js",
    context.request,
  );
};
