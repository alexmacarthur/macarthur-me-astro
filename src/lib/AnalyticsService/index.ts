import gaData from './ga-data.json';

class AnalyticsService {
  gaData;

  constructor() {
    this.gaData = gaData;
  }

  log(message) {
    console.log(`ANALYTICS SERVICE LOG - ${message}`);
  }

  async getPageViewCount(): Promise<number> {
    return Number(this.gaData.totalPageViewsForSite);
  }

  async getTotalViews(): Promise<null | number> {
    const params = this.getBaseUrlParams();
    params.set('metrics', 'pageviews');

    const url = this.contructStatusEndpoint(params);

    return await (async () => {
      try {
        const data = await this.getPlausibleData(url);

        return Number(data.results.pageviews.value);
      } catch(e) {
        this.log(e);

        return 0;
      }
    })() + Number(this.gaData.totalPageViewsForSite);
  }

  async getTotalPostViews(slug: string): Promise<string> {
    const gaPostViews = this.getGaPostViews(slug);
    const plausiblePostViews = await this.getPlausiblePostViews(slug);
    const total = gaPostViews + plausiblePostViews;

    if(!total) return "";

    return total.toLocaleString();
  }

  getGaPostViews(slug: string): number {
    const rawValue = this.gaData.postViewCounts[slug];

    if(!rawValue) return 0;

    return Number(this.gaData.postViewCounts[slug]);
  }

  async getPlausiblePostViews(slug: string): Promise<number> {
    const params = this.getBaseUrlParams();

    params.append('filters', `event:page==/posts/${slug}`);

    const url = this.contructStatusEndpoint(params);

    try  {
      const data = await this.getPlausibleData(url);

      return Number(data.results.visitors.value);
    } catch(e) {
      this.log(e.message);
      return 0;
    }
  }

  getBaseUrlParams(): URLSearchParams {
    const today = (new Date()).toISOString().split('T')[0];
    const params = new URLSearchParams();
    params.append('site_id', 'macarthur.me');
    params.append('period', 'custom');
    params.append('date', `2021-01-01,${today}`);

    return params;
  }

  async getPlausibleData(url: string) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + import.meta.env.PLAUSIBLE_API_KEY
      }
    });

    return response.json();
  }

  contructStatusEndpoint(params: URLSearchParams) {
    return `https://analytics.macarthur.me/api/v1/stats/aggregate?${params.toString()}`;
  }
}

export default AnalyticsService;
