class WordPressService {
  async getPluginDownloadCount() {
    const response = await fetch(
      "https://api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[author]=alexmacarthur"
    );
    const { plugins } = await response.json();

    return plugins.reduce((total, plugin) => {
      total = total + plugin.downloaded;

      return total;
    }, 0);
  }
}

export default WordPressService;
