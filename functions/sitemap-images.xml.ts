export const onRequest: PagesFunction = async (context) => {
  return fetch("https://picperf.io/sitemap/macarthur.me", context.request);
};
