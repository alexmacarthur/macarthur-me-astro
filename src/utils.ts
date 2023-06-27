import { SITE_URL } from "./lib/constants";
import type { GhostPost } from "./types/types";

export const isProduction = () => {
  return import.meta.env.NODE_ENV === "production";
};

export const randomInRange = (min, max): number => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const fullUrlFromPath = (path) => {
  return `${SITE_URL}${path}`;
};

export const prefersReducedMotion = () => {
  if (typeof window == undefined) return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)")?.matches;
};

export function sendEvent(eventName: string, eventProps: EventProps = {}) {
  eventProps.path = window.location.pathname;

  if (!window.plausible || import.meta.env.NODE_ENV === "development") {
    return console.log({
      event_name: eventName,
      event_data: eventProps,
    });
  }

  window.plausible(eventName, {
    props: eventProps,
  });
}

export const getCurrentPath = (astro) => {
  return new URL(astro.request.url).pathname;
};

export function hasPromotion(post: GhostPost) {
  return post.tags.some((tag) => tag.slug.startsWith("promote-"));
}
