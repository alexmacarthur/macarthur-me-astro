class AnalyticsService {
  totalSiteViews: number | null = null;

  async getTotalSiteViews(): Promise<number> {
    if (this.totalSiteViews) {
      return this.totalSiteViews;
    }

    return this.fetchTotalSiteViews();
  }

  async getPageViews(slug: string): Promise<[string, number]> {
    const response = await fetch(
      `https://macarthur-me-api.vercel.app/api/stats?slug=${slug}`
    );
    const { views } = await response.json();

    return [views, parseInt(views.replace(/\,/g, ""), 10)];
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
