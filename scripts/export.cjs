#!/usr/bin/node

const { posts } = require("../src/db.json");
const GhostAdminAPI = require("@tryghost/admin-api");
const path = require("path");
const fs = require("fs");
const S3 = require("aws-sdk/clients/s3.js");

require("dotenv").config();

const getApi = () => {
  return new GhostAdminAPI({
    url: "https://cms.macarthur.me",
    key: process.env.GHOST_ADMIN_KEY,
    version: "v5.0",
  });
};

const s3 = new S3({
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_KEY}.r2.cloudflarestorage.com`,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

async function getImage(key) {
  try {
    return await s3
      .getObject({
        Bucket: "macarthur-me",
        Key: key,
      })
      .promise();
  } catch (_e) {
    console.error("ERROR GETTING IMAGE!", key);
    console.error(_e);
    return null;
  }
}

async function processImagesInHTML(html) {
  var api = getApi();

  try {
    let imageRegex = /<img\s+src='\/proxy\/([^']+)'/gim;
    let imagePromises = [];

    while ((result = imageRegex.exec(html)) !== null) {
      let file = result[1];

      const r2Image = await getImage(file);
      const extension = /image\/(.*)/.exec(r2Image.ContentType)[1];
      const filePath = `${path.resolve(
        __dirname,
        "./img"
      )}/${file}.${extension}`;

      fs.writeFileSync(filePath, r2Image.Body);

      imagePromises.push(
        api.images.upload({
          ref: `/proxy/${file}`,
          file: path.resolve(filePath),
        })
      );
    }

    return Promise.all(imagePromises).then((images) => {
      images.forEach((image) => (html = html.replace(image.ref, image.url)));
      return html;
    });
  } catch (e) {
    console.error("ERROR PROCESSING IMAGES IN HTML!", e);
    return html;
  }
}

(async () => {
  const postsToHandle = posts;
  let count = 0;

  for (let i = 0; i < postsToHandle.length; i++) {
    var api = getApi();

    const index = i;
    const post = postsToHandle[i];
    let { title, slug, html, openGraphImage, date, lastUpdated, subtitle } =
      post;
    const data = {
      id: index + 1,
      title,
      slug,
      html,
      feature_image: openGraphImage,
      status: "published",
      created_at: date,
      published_at: date,
      published_by: 1,
      created_by: 1,
      author_id: 1,
    };

    if (subtitle) {
      data.meta_description = subtitle;
      data.custom_excerpt = subtitle;
    }

    if (lastUpdated) {
      data.updated_at = lastUpdated;
      data.updated_by = 1;
    }

    await new Promise((resolve) => {
      setTimeout(() => {
        console.log("PAUSING...");
        resolve();
      }, 1000);
    });

    try {
      data.html = await processImagesInHTML(html);

      const res = await api.posts.add(data, {
        source: "html",
      });

      count++;
      console.log(`FINISHED: ${res.slug}`);
    } catch (e) {
      console.error("ERROR!", data.slug);
      console.error(e);
    }
  }

  console.log(`Finished ${count} posts`);
})();
