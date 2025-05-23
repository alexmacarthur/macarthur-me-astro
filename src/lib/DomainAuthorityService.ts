import * as cheerio from "cheerio";

class DomainAuthorityService {
  async fetchAuthority() {
    const response = await fetch(
      "https://moz.com/domain-analysis?site=macarthur.me",
      {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "no-cache",
          pragma: "no-cache",
        },
        referrer: "https://moz.com/domain-analysis",
        referrerPolicy: "origin-when-cross-origin",
      },
    );

    const html = await response.text();

    const $ = cheerio.load(html);

    const value = $("h5")
      .filter((_, el) => $(el).text().trim() === "Domain Authority")
      .next("h1")
      .text()
      .trim();

    return Number(value);
  }
}

export default new DomainAuthorityService();
