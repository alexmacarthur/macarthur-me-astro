class AnalyticsService {
  totalSiteViews: number | null = null;

  async getTotalSiteViews(): Promise<number> {
    if (this.totalSiteViews) {
      return this.totalSiteViews;
    }

    return this.fetchTotalSiteViews();
  }

  private async fetchTotalSiteViews(): Promise<number> {
    const response = await fetch(
      `${import.meta.env.PUBLIC_MACARTHUR_API_BASE_URL}/api/stats`
    );
    const { views } = await response.json();

    return views;
  }
}

export default new AnalyticsService();
