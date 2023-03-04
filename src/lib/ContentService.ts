import GhostContentAPI from '@tryghost/content-api'

const api = new GhostContentAPI({
  url: import.meta.env.GHOST_URL,
  key: import.meta.env.GHOST_KEY,
  version: import.meta.env.GHOST_VERSION
});

class ContentService {
  getPosts() {
    return api.posts.browse({
      page: 2
    });
  }
}

export default new ContentService();
