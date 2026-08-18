import type { Article } from "@/lib/content/article-schema";

type ArticleCardProps = Pick<
  Article,
  "category" | "readingMinutes" | "slug" | "summary" | "title"
>;

export function ArticleCard({
  category,
  readingMinutes,
  slug,
  summary,
  title,
}: ArticleCardProps) {
  return (
    <article className="article-card">
      <header>
        <p>
          <span>{category}</span>
          {" · "}
          <span>{readingMinutes} 分钟阅读</span>
        </p>
        <h2>
          <a href={`/articles/${slug}`}>{title}</a>
        </h2>
      </header>
      <p>{summary}</p>
    </article>
  );
}
