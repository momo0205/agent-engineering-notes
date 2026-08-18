import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

const allowedTags = Array.from(
  new Set([...sanitizeHtml.defaults.allowedTags, "h1", "h2", "img"]),
);

export function renderMarkdown(markdown: string): string {
  const rendered = marked.parse(markdown, { async: false });

  return sanitizeHtml(rendered, {
    allowedTags,
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "title"],
    },
    allowedSchemes: ["https"],
    allowProtocolRelative: false,
  });
}
