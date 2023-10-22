export const onRequest: PagesFunction = async (context) => {
  return fetch(
    "https://alexmacarthur.github.io/slide-element",
    context.request
  );
};
