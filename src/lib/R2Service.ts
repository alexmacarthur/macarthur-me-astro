import S3 from "aws-sdk/clients/s3.js";
import sharp from "sharp";

const s3 = new S3({
  endpoint: `https://${import.meta.env.CLOUDFLARE_ACCOUNT_KEY}.r2.cloudflarestorage.com`,
  accessKeyId: import.meta.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

const BUCKET_NAME = "macarthur-me";

class R2Service {
  getBucket() {
    return s3.listObjects({ Bucket: BUCKET_NAME }).promise();
  }

  async getFile(key: string) {
    try {
      return await s3
        .getObject({
          Bucket: BUCKET_NAME,
          Key: key,
        })
        .promise();
    } catch (_e) {
      console.log(_e);
      return null;
    }
  }

  async optimizeImageBlob(blob: ArrayBuffer, isGif: boolean) {
    if(isGif) {
      return sharp(blob, { animated: true })
        .gif()
        .toBuffer();
    }

    return sharp(blob)
      .resize({ width: 900 })
      .webp({ quality: 100 })
      .toBuffer();
  }

  async uploadImage({ imageUrl, key }: { imageUrl: string; key: string }) {
    const res = await fetch(imageUrl);
    const blob = await res.arrayBuffer();
    const contentType = res.headers.get("Content-Type");
    const isGif = contentType.includes("image/gif");
    const imageBuffer = await this.optimizeImageBlob(Buffer.from(blob), isGif);

    return s3
      .upload({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: imageBuffer,
        ContentType: isGif ? "image/gif" : "image/webp"
      })
      .promise();
  }
}

export default R2Service;
