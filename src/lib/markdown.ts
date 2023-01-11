import { remark } from "remark";
import strip from "strip-markdown";
import { visit } from "unist-util-visit";

export function stripMarkdown(markdown: string) {
  const result = remark().use(strip).processSync(markdown);

  return result.toString().replace(/[\r\n]+/gm, " ");
}

export function extractUrl(markdown: string): string | undefined {
  return markdown.match(/!\[.*?\]\((.*)\)/)?.[1];
}

export function generateExcerptFromMarkdown(content: string, wordCount = 50) {
  const strippedContent = stripMarkdown(content)
    .replace(/\s\s+/g, " ")
    .replace(/\r?\n|\r/g, "")
    .replace(/\S+\.(gif|png|jpe?g)/g, ""); // Remove images.
  const words = strippedContent.split(" ");

  return words.slice(0, wordCount).join(" ") + "...";
}

export function externalMarkdownLinks() {
  return (ast) => {
    function visitor(node) {
      const data = node.data || (node.data = {});
      const props = data.hProperties || (data.hProperties = {});
      const url = node.url;

      if (!url.includes("macarthur.me")) {
        props.target = "_blank";
        props.rel = "noopener";
      }

      return node;
    }

    visit(ast, "link", visitor);
  };
}

export function lazyLoadImages() {
  return (ast) => {
    visit(ast, "image", (node) => {
      const html = `<img src='${node.url}' alt='${node.alt}' loading='lazy' />`;
      node.type = "html";
      node.children = undefined;
      node.value = html;
    });
  };
}
