class TwitterService {
  async getFollowerCount() {
    const response = await fetch(
      "https://api.twitter.com/1.1/followers/ids.json?screen_name=amacarthur",
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.TWITTER_BEARER_TOKEN}`,
        },
      }
    );

    const { ids } = await response.json();

    return ids.length;
  }
}

export default new TwitterService();
