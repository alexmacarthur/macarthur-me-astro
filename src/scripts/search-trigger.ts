import { sendEvent } from "../utils";

export function handleTrigger() {
  document.body.dispatchEvent(new CustomEvent("search:open"));

  sendEvent("search_open", {
    method: "input-trigger",
  });
}

document.addEventListener("astro:before-preparation", function () {
  document.querySelectorAll(".search-trigger").forEach((trigger) => {
    trigger.removeEventListener("click", handleTrigger);
  });
});

document.addEventListener("astro:page-load", function () {
  document.querySelectorAll(".search-trigger").forEach((trigger) => {
    trigger.addEventListener("click", handleTrigger);
  });
});
