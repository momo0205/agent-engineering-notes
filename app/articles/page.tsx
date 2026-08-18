import { ArticleCard } from "@/components/article-card";
import { visibleArticles } from "@/lib/content/article-repository";

export default function ArticlesPage() {
  const articles = visibleArticles();

  return (
    <main>
      <h1>文章</h1>
      <section aria-label="文章列表">
        {articles.map((article) => (
          <ArticleCard key={article.slug} {...article} />
        ))}
      </section>
    </main>
  );
}
