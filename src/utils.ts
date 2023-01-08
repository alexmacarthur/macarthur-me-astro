export const getCurrentPath = (astro) => {
  return new URL(astro.request.url).pathname;
}
