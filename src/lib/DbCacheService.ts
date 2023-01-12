import { client } from "./SupabaseService";

const EXPIRATION_MINUTES = 10;

class DbCacheService {
  table: string;

  constructor(table: string) {
    this.table = table;
  }

  async get(key: string) {
    const { data } = await client.from(this.table).select().eq("key", key);

    if (!data.length) {
      return null;
    }

    if (this.isExpired(data[0].created_at)) {
      console.log(`Wiping expired cache for: ${key}`);

      await client.from(this.table).delete().match({ id: data[0].id });

      return null;
    }

    console.log(`Using cache for: ${key}`);
    return data[0].data;
  }

  async put(key: string, data: any) {
    return client.from(this.table).insert([
      {
        key,
        data,
      },
    ]);
  }

  private isExpired(createdAt: string) {
    const then = new Date(createdAt);
    const minutesAgo = new Date(Date.now() - 1000 * (60 * EXPIRATION_MINUTES));

    return then < minutesAgo;
  }
}

export default DbCacheService;
