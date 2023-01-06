import { SITE_URL } from "./constants";

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
