export const getRepos = async (client) => {
  let [, repoData] = await client.getAsync("/users/alexmacarthur/repos", {
    per_page: 100,
    type: "public",
  });

  console.log(`Fetched ${repoData.length} repositories from GitHub...`);

  // Immediately filter out the forks.
  return repoData.filter((repo) => !repo.fork);
};

export const getCommits = async (repoData, client) => {
  const commitPromises = repoData.map(async (repo) => {
    return await client.getAsync(`/repos/alexmacarthur/${repo.name}/commits`, {
      per_page: 1,
    });
  });

  let commitData = (await Promise.allSettled(
    commitPromises
  )) as unknown as any[];
  console.log("Got commit data...");

  return commitData
    .filter((commit) => commit.status === "fulfilled")
    .map((commit) => commit.value[1][0])
    .reduce((allCommitData, commit) => {
      const repoName = commit?.commit.url.match(/alexmacarthur\/(.+)\/git/)[1];

      allCommitData[repoName] = commit;

      return allCommitData;
    }, {});
};

export const getTags = async (repoData, client) => {
  const tagPromises = repoData.map(async (repo) => {
    return await client.getAsync(`/repos/alexmacarthur/${repo.name}/tags`, {
      per_page: 1,
    });
  });

  let tagData = (await Promise.allSettled(tagPromises)) as unknown as any[];

  console.log("Got tag data...");

  return tagData
    .filter((tag) => tag.status === "fulfilled")
    .filter((tag) => tag.value[1].length > 0)
    .map((tag) => tag.value[1][0])
    .reduce((alltagData, tag) => {
      const repoName = tag.zipball_url.match(/alexmacarthur\/(.+)\/zipball/)[1];
      alltagData[repoName] = tag;

      return alltagData;
    }, {});
};
