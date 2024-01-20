import type { GhostPost, Views } from "../types/types";

class AnalyticsService {
  totalSiteViews: number | null = null;

  async getTotalSiteViews(): Promise<number> {
    if (this.totalSiteViews) {
      return this.totalSiteViews;
    }

    return this.fetchTotalSiteViews();
  }

  async getPageViews(slug: string): Promise<[string, number]> {
    try {
      const response = await fetch(
        `https://macarthur-me-api.vercel.app/api/stats?slug=${slug}`
      );

      const { views } = await response.json();

      return [views, parseInt(views.replace(/\,/g, ""), 10)];
    } catch (error) {
      console.error(error);
      return ["0", 0];
    }
  }

  async makePageViewMap(posts: GhostPost[]): Promise<Map<string, Views>> {
    const viewMap = new Map<string, Views>();

    await Promise.all(
      posts.map(async (post) => {
        const viewData = await this.getPageViews(post.slug);

        viewMap.set(post.slug, viewData);
      })
    );

    return viewMap;
  }

  private async fetchTotalSiteViews(): Promise<number> {
    const response = await fetch(
      `${import.meta.env.PUBLIC_MACARTHUR_API_BASE_URL}/stats`
    );
    const { views } = await response.json();

    return views;
  }
}

export default new AnalyticsService();
