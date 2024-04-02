export const onRequest: PagesFunction = async (context) => {
  return fetch(
    "https://picperf.io/sitemap/macarthur.me/index.xml",
    context.request
  );
};
