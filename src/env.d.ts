/// <reference types="astro/client" />

interface EventProps {
  [key: string]: string | number | boolean;
}
interface Window {
  plausible: (eventName: string, eventProps: { props: EventProps }) => void;
}

declare module "lowdb/node" {
  export function JSONFile<T>(path: string): void;
}
