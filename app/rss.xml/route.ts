import { visibleArticles } from "../../lib/content/article-repository";
import { canonicalBaseUrl } from "../../lib/publishing/site-url";

const SITE_TITLE = "Agent 工程笔记";
const SITE_DESCRIPTION =
  "从 Java 后端到 Agent Engineering：代码、失败、实验和工程判断。";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET(): Response {
  const base = canonicalBaseUrl();
  const items = visibleArticles()
    .map((article) => {
      const link = `${base}/articles/${encodeURIComponent(article.slug)}`;

      return [
        "    <item>",
        `      <title>${escapeXml(article.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid>${escapeXml(link)}</guid>`,
        `      <pubDate>${new Date(`${article.publishedAt}T00:00:00.000Z`).toUTCString()}</pubDate>`,
        `      <description>${escapeXml(article.summary)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    `    <title>${SITE_TITLE}</title>`,
    `    <description>${SITE_DESCRIPTION}</description>`,
    `    <link>${escapeXml(base)}</link>`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
