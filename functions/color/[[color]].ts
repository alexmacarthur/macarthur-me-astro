export const onRequest: PagesFunction = async (context) => {
  return fetch("https://color-macarthur-me.netlify.app", context.request);
};
