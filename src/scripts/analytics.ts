const viewCounts = document.querySelectorAll('[data-view-count-slug]');

viewCounts.forEach((viewCount) => {
  const slug = (viewCount as HTMLElement).dataset.viewCountSlug;
  const statEl = viewCount.querySelector('[data-view-count-stat]') as HTMLElement;

  setTimeout(() => {
    fetch(`https://macarthur-me-api.vercel.app/api/stats?slug=${slug}`)
      .then((response) => response.json())
      .then(({ views }) => {
        statEl.textContent = views;
      });
    }, 500);
});
