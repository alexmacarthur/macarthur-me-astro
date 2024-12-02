export function onRequest(context) {
  return fetch(
    context.request.url.replace(
      "https://macarthur.me",
      "https://go.jamcomments.com",
    ),
    context.request,
  );
}

// if (context.request.url.includes("/jamcomments/")) {

// }
