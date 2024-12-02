export function onRequestGet(context) {
  return fetch(
    context.request.url.replace(
      "https://macarthur.me",
      "https://go.jamcomments.com"
    ),
    context.request
  );
}
