import { sendEvent } from "../utils";

let isBeingHandled = false;

export function handleTrigger() {
  if (isBeingHandled) {
    return;
  }

  isBeingHandled = true;

  document.body.dispatchEvent(new CustomEvent("search:open"));

  sendEvent("search_open", {
    method: "input-trigger",
  });

  isBeingHandled = false;
}

document.addEventListener("astro:page-load", function () {
  const searchTrigger = document.getElementById("searchTrigger") as HTMLElement;

  document.querySelectorAll(".search-trigger").forEach((trigger) => {
    trigger.addEventListener("click", handleTrigger);
  });
});
