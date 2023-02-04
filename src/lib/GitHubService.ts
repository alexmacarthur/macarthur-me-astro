import gitHub from "octonode";
import DbCacheService from "./DbCacheService";

type ProjectRepo = {
  html_url: string;
  description: string;
  name: string;
  stargazers_count: number;
};

class GitHubService {
  dbCache: DbCacheService;
  cachedData: any;
  client: any;
  repos: any[];

  constructor() {
    this.dbCache = new DbCacheService();
    this.cachedData = this.dbCache.readGitHubData();
    this.repos = [];
    this.client = gitHub.client(import.meta.env.GITHUB_ACCESS_TOKEN);
  }

  async getFollowerCount(): Promise<number> {
    if (this.cachedData.followerCount) {
      return this.cachedData.followerCount;
    }

    const data = await this.getUserData();

    this.dbCache.saveGitHubData({
      followerCount: data.followers,
    });

    return data.followers;
  }

  async getTotalStars(): Promise<number> {
    if (this.cachedData.totalStars) {
      return this.cachedData.totalStars;
    }

    const totalStars = (await this.getRepos()).reduce(
      (total, { stargazers_count }) => {
        total = total + (stargazers_count || 0);

        return total;
      },
      0
    );

    this.dbCache.saveGitHubData({ totalStars });

    return totalStars;
  }

  async getProjectReposData(): Promise<ProjectRepo[]> {
    if (this.cachedData.projectRepos) {
      return this.cachedData.projectRepos;
    }

    const repoData = await this.getRepos();
    const commitData = await this.getCommits(repoData);
    const tagData = await this.getTags(repoData);

    const mashedRepoData = repoData // Only permit those with stars
      .filter((repo) => repo.stargazers_count > 0)

      // Only permit those with commits made in the last two years.
      .filter((repo) => {
        const commit = commitData[repo.name];

        if (!commit) {
          return false;
        }

        const lastCommitDate = commit?.commit?.author?.date;
        const updatedDate = new Date(lastCommitDate);

        const nowDate = new Date();
        const pastTime = nowDate.setMonth(nowDate.getMonth() - 36);

        return updatedDate.getTime() > pastTime;
      })

      // Only those that have a tag/release.
      .filter((repo) => !!tagData[repo.name])

      // Only those that are not archived.
      .filter((repo) => !repo.archived)

      // Normalize the data.
      .map((repo) => {
        return {
          html_url: repo.html_url,
          description: repo.description.trim(),
          name: repo.name,
          stargazers_count: repo.stargazers_count,
        };
      });

    this.dbCache.saveGitHubData({ projectRepos: mashedRepoData });

    return mashedRepoData;
  }

  private async getUserData() {
    const [, data] = await this.client.getAsync("/users/alexmacarthur");

    return data;
  }

  private async getRepos(): Promise<any[]> {
    if (this.repos.length) {
      return this.repos;
    }

    let [, repoData] = await this.client.getAsync(
      "/users/alexmacarthur/repos",
      {
        per_page: 100,
        type: "public",
      }
    );

    console.log(`Fetched ${repoData.length} repositories from GitHub...`);

    // Immediately filter out the forks.
    this.repos = repoData.filter((repo) => !repo.fork);

    return this.repos;
  }

  private async getCommits(repoData) {
    const commitPromises = repoData.map(async (repo) => {
      return await this.client.getAsync(
        `/repos/alexmacarthur/${repo.name}/commits`,
        {
          per_page: 1,
        }
      );
    });

    let commitData = (await Promise.allSettled(
      commitPromises
    )) as unknown as any[];

    console.log("Got commit data...");

    return commitData
      .filter((commit) => commit.status === "fulfilled")
      .map((commit) => commit.value[1][0])
      .reduce((allCommitData, commit) => {
        const repoName = commit?.commit.url.match(
          /alexmacarthur\/(.+)\/git/
        )[1];

        allCommitData[repoName] = commit;

        return allCommitData;
      }, {});
  }

  private async getTags(repoData) {
    const tagPromises = repoData.map(async (repo) => {
      return await this.client.getAsync(
        `/repos/alexmacarthur/${repo.name}/tags`,
        {
          per_page: 1,
        }
      );
    });

    let tagData = (await Promise.allSettled(tagPromises)) as unknown as any[];

    console.log("Got tag data...");

    return tagData
      .filter((tag) => tag.status === "fulfilled")
      .filter((tag) => tag.value[1].length > 0)
      .map((tag) => tag.value[1][0])
      .reduce((alltagData, tag) => {
        const repoName = tag.zipball_url.match(
          /alexmacarthur\/(.+)\/zipball/
        )[1];
        alltagData[repoName] = tag;

        return alltagData;
      }, {});
  }

  private async getRIHRepos(): Promise<ProjectRepo[]> {
    const repoSlugs = [
      "RamseyInHouse/steppp",
      "RamseyInHouse/feedback-component",
    ];

    const [, repos] = await this.client.getAsync("/orgs/ramseyinhouse/repos", {
      per_page: 100,
      type: "public",
    });

    const myRepos = repos.filter((r) => {
      return repoSlugs.some((slug) => {
        return new RegExp(slug, "i").test(r.full_name);
      });
    });

    return myRepos.map((repo) => {
      return {
        html_url: repo.html_url,
        description: repo.description.trim(),
        name: repo.name,
        stargazers_count: repo.stargazers_count,
      };
    });
  }
}

export default new GitHubService();
