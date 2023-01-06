class NpmService {
  async getPackageSlugs(): Promise<string[]> {
    const response = await fetch(
      "https://api.npms.io/v2/search?q=author:alexmacarthur"
    );
    const { results } = await response.json();

    return results.map((result) => result.package.name);
  }

  async getTotalDownloads() {
    let totalCount = 0;

    for (const slug of await this.getPackageSlugs()) {
      const response = await fetch(
        `https://api.npmjs.org/downloads/range/last-year/${slug}`
      );
      const { downloads } = await response.json();
      const downloadCount = downloads.reduce((total, day) => {
        total = total + day.downloads;

        return total;
      }, 0);

      totalCount = totalCount + downloadCount;
    }

    return totalCount;
  }
}

export default NpmService;
