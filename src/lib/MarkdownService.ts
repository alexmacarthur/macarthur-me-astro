import matter from "gray-matter";
import path, { join } from "path";
import fs from "fs";
// import getConfig from "next/config";
import type { ContentEntity } from "../types/types";
import { externalMarkdownLinks, generateExcerptFromMarkdown } from "./markdown";
import { PluggableList, Preset, unified } from "unified";
import remarkParse from "remark-parse";
import remarkPrism from "remark-prism";
import remarkGfm from "remark-gfm";
import remarkEmbedder from "@remark-embedder/core";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkHtml from "remark-html";

// const { serverRuntimeConfig } = getConfig();

if (process.platform === "win32") {
  import.meta.env.ESBUILD_BINARY_PATH = path.join(
    process.cwd(),
    "node_modules",
    "esbuild",
    "esbuild.exe"
  );
} else {
  import.meta.env.ESBUILD_BINARY_PATH = path.join(
    process.cwd(),
    "node_modules",
    "esbuild",
    "bin",
    "esbuild"
  );
}

const CodepenTransformer = {
  name: "Codepen",

  shouldTransform(url) {
    const { host, pathname } = new URL(url);

    return ["codepen.io"].includes(host) && pathname.includes("/pen/");
  },

  getHTML(url) {
    const [, username, id] = url.match(/codepen\.io\/(.+)\/pen\/(.+)/);

    return `
      <div>
        <p class="codepen" data-height="300" data-default-tab="html,result" data-slug-hash="${id}" data-user="${username}" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
          <span><a href="${url}">See the Pen</a> on <a href="https://codepen.io">CodePen</a>.</span>
        </p>
        <script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
      </div>
    `;
  },
};

class MarkdownSerivce {
  // pageDirectory: string;

  constructor() {
    // this.pageDirectory = join(serverRuntimeConfig.PROJECT_ROOT, `_pages`);
  }

  async processMarkdown(rawMarkdown: string): Promise<{
    code: string;
  }> {
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkPrism)
      .use(remarkEmbedder, { transformers: [CodepenTransformer] })
      .use(rehypeSlug)
      .use(externalMarkdownLinks)
      .use(rehypeAutolinkHeadings as Preset | PluggableList)
      .use(remarkHtml, { sanitize: false })
      .process(rawMarkdown);

    return {
      code: String(file),
    };
  }

  // getPage(slug: string): ContentEntity {
  //   const fullPath = join(this.pageDirectory, `${slug}.md`);
  //   const fileContents = fs.readFileSync(fullPath, "utf8");
  //   const { data: frontmatterData, content } = matter(fileContents);

  //   return {
  //     slug,
  //     markdown: content,
  //     description: generateExcerptFromMarkdown(content),
  //     title: frontmatterData.title,
  //     subtitle: frontmatterData.subTitle || "",
  //     openGraphImage: frontmatterData.openGraphImage || "",
  //   };
  // }

  // getAllPageSlugs(): string[] {
  //   const pageFiles = fs.readdirSync(this.pageDirectory);

  //   return pageFiles.map((file) => file.replace(/.md$/, ""));
  // }

  // async getAllPages(): Promise<ContentEntity[]> {
  //   return this.getAllPageSlugs().map(this.getPage.bind(this));
  // }
}

export default MarkdownSerivce;
