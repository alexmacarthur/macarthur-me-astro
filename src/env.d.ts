/// <reference types="astro/client" />

interface EventProps {
  [key: string]: string | number | boolean;
}
interface Window {
  plausible: (eventName: string, eventProps: { props: EventProps }) => void;
}
