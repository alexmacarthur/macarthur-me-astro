import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

export type Data = {
  github: {
    totalStars?: number;
    followerCount?: number;
    projectRepos?: {
      html_url: string;
      description: string;
      name: string;
      stargazers_count: number;
    }[];
  };
};

const __dirname = dirname(fileURLToPath(import.meta.url));

class DbCacheService {
  db: any;

  constructor() {
    const file = join(__dirname, "db.json");
    const adapter = new JSONFile<Data>(file);
    this.db = new Low<Data>(adapter, { github: {} });
  }

  async read(): Promise<void> {
    await this.db.read();

    this.db.data ||= { github: {} };
  }

  async readGitHubData(): Promise<Data["github"]> {
    await this.read();

    return this.db.data.github;
  }

  async saveGitHubData(data: Partial<Data["github"]>) {
    this.db.data.github = {
      ...this.db.data.github,
      ...data,
    };

    return this.db.write();
  }
}

export default DbCacheService;
