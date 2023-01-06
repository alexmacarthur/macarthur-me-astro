export function createObserver(imageElement, callback: () => any) {
  const options = {
    rootMargin: "100px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback();
        observer.unobserve(imageElement);
      }
    });
  }, options);

  return {
    observe: () => observer.observe(imageElement),
    kill: () => observer.unobserve(imageElement),
  };
}

export function activateImage(imageElement, loadCallback) {
  imageElement.addEventListener("load", loadCallback);
  imageElement.src = imageElement.dataset.lazySrc;
}
