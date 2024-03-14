import { SITE_URL, TAGLINE } from "./lib/constants";

export const isProduction = () => {
  return import.meta.env.NODE_ENV === "production";
};

export const getOpenGraphUrl = ({
  image,
  path,
  title,
}: {
  path: string;
  image: string;
  title: string;
}) => {
  if (path === "/") {
    return buildOpenGraphUrl(TAGLINE);
  }

  return image || buildOpenGraphUrl(title);
};

export const buildOpenGraphUrl = (title: string) => {
  return `https://www.macarthur.me/open-graph?title=${encodeURIComponent(
    title
  )}&v=2`;
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
