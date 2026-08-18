import type { Article, ArticleMetadata } from "./article-schema";

export type SearchArticleMetadata = Pick<
  ArticleMetadata,
  "category" | "readingMinutes" | "summary" | "title"
> & { slug: string; tags: readonly string[] };

export function toSearchItems(
  articles: readonly Article[],
): SearchArticleMetadata[] {
  return articles
    .filter(({ status }) => status === "published")
    .map(({ slug, title, summary, tags, category, readingMinutes }) => ({
      slug,
      title,
      summary,
      tags,
      category,
      readingMinutes,
    }));
}
