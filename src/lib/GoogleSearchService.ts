class GoogleSearchService {
  async search(query: string, cx: string): Promise<any> {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${
        import.meta.env.GOOGLE_CUSTOM_SEARCH_API_KEY
      }&cx=${cx}&q=${query}`
    );

    return await response.json();
  }

  async getJsWeeklyTotalResults(): Promise<number> {
    const results = await this.search(
      "alex%20macarthur",
      import.meta.env.GOOGLE_CUSTOM_SEARCH_JSWEEKLY_CX
    );

    return Number(results.searchInformation.totalResults);
  }
}

export default new GoogleSearchService();
