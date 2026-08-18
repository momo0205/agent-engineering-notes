import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  articleMetadataSchema,
  type Article,
} from "./article-schema";

const defaultArticlesRoot = path.join(process.cwd(), "content", "articles");

export function parseArticle(filename: string, source: string): Article {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(filename)) {
    throw new Error(`Invalid article filename: ${filename}`);
  }

  const { data, content } = matter(source);
  const metadata = articleMetadataSchema.parse(data);

  return {
    ...metadata,
    slug: filename.slice(0, -3),
    body: content.trim(),
  };
}

export function allArticles(root = defaultArticlesRoot): Article[] {
  if (!existsSync(root)) {
    return [];
  }

  return readdirSync(root)
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) =>
      parseArticle(filename, readFileSync(path.join(root, filename), "utf8")),
    )
    .sort(
      (left, right) =>
        right.updatedAt.localeCompare(left.updatedAt) ||
        left.slug.localeCompare(right.slug),
    );
}

export function visibleArticles(articles = allArticles()): Article[] {
  return articles.filter(({ status }) => status === "published");
}

export function articleBySlug(
  slug: string,
  articles = allArticles(),
): Article | undefined {
  return articles.find(
    (article) => article.slug === slug && article.status === "published",
  );
}
