export type Key =
  | `domain_authority`
  | `related_posts:${string}`
  | `strava:access_token`
  | `strava:refresh_token`;

class KvService {
  async getByKey(key: Key) {
    const url =
      `https://api.cloudflare.com/client/v4/accounts/${import.meta.env.CLOUDFLARE_ACCOUNT_KEY}` +
      `/storage/kv/namespaces/${import.meta.env.CLOUDFLARE_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${import.meta.env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "text/plain",
      },
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch KV: ${res.status} ${res.statusText}`);
    }

    return await res.text();
  }

  async update<T extends string | number | object>(
    key: Key,
    value: T,
    expirationInSeconds?: number,
  ): Promise<T> {
    const params = new URLSearchParams();

    if (expirationInSeconds) {
      params.set("expiration_ttl", String(expirationInSeconds));
    }

    const url =
      `https://api.cloudflare.com/client/v4/accounts/${import.meta.env.CLOUDFLARE_ACCOUNT_KEY}` +
      `/storage/kv/namespaces/${import.meta.env.CLOUDFLARE_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}?${params}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${import.meta.env.CLOUDFLARE_API_TOKEN}`,
      },
      body: value.toString(),
    });

    return value;
  }
}

export default new KvService();
