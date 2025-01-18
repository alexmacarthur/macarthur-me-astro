import { sendEvent } from "../utils";

document.addEventListener("astro:page-load", function () {
  const searchTrigger = document.getElementById("searchTrigger") as HTMLElement;

  searchTrigger.addEventListener("click", () => {
    document.body.dispatchEvent(new CustomEvent("search:open"));

    sendEvent("search_open", {
      method: "input-trigger",
    });
  });
});
