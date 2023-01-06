import { CountUp } from "countup.js";

const counters = document.querySelectorAll('[data-counter-value]');

counters.forEach((counter) => {
  const counterEl = counter as HTMLElement;

  if(counterEl.dataset.counterDisabled !== undefined) return;

  const countUp = new CountUp(counterEl, parseInt((counterEl).dataset.counterValue as string, 10));

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          countUp.start();
          observer.unobserve(counterEl);
        }
      });
    },
    {
      rootMargin: "0px",
      threshold: 1.0,
    }
  );

  observer.observe(counter);
});
