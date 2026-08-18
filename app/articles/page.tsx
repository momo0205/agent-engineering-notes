import { SearchFilter, type SearchArticleMetadata } from "@/components/search-filter";
import { visibleArticles } from "@/lib/content/article-repository";

export default function ArticlesPage() {
  const articles: SearchArticleMetadata[] = visibleArticles().map((article) => ({
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    tags: article.tags,
    category: article.category,
    readingMinutes: article.readingMinutes,
  }));

  return (
    <main id="main-content">
      <header className="page-intro articles-intro">
        <p className="eyebrow">Published notes</p>
        <h1>文章</h1>
        <p>只展示已经公开发布的学习记录、工程实践与真实复盘。</p>
      </header>
      <SearchFilter articles={articles} />
    </main>
  );
}
