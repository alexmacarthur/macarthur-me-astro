import { sendEvent } from "../utils";

const links = document.querySelectorAll("a[data-link-id]");

console.log(links);

links.forEach((link) => {
  const linkId = (link as HTMLElement).dataset.linkId as string;

  link.addEventListener("click", () => {
    sendEvent("link_click", { link_id: linkId });
  });
});
