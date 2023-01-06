import R2Service from "./R2Service";

class StaticAssetService {
  provider;

  constructor() {
    this.provider = new R2Service();
  }

  get(key: string) {
    return this.provider.getFile(key);
  }

  async put(imageUrl: string, key: string): Promise<any> {
    try {
      if (await this.get(key)) {
        console.log(`Already uploaded! Skipping: ${key}`);

        return Promise.resolve();
      }
    } catch (e) {
      console.error(`Retrieval failed! Key: ${key}, url: ${imageUrl}`);
      return Promise.resolve();
    }

    try {
      console.log(`Uploading image: ${key}`);

      return this.provider.uploadImage({
        imageUrl,
        key,
      });
    } catch (e) {
      console.error(`Upload failed! Key: ${key}, url: ${imageUrl}`);
      return Promise.resolve();
    }
  }
}

export default StaticAssetService;
