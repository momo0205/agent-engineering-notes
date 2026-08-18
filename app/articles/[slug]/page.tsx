import { notFound } from "next/navigation";
import { ArticleBody } from "../../../components/article-body";
import {
  articleBySlug,
  visibleArticles,
} from "../../../lib/content/article-repository";
import { renderMarkdown } from "../../../lib/content/markdown-renderer";
import { generateArticleMetadata } from "./route-metadata";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return visibleArticles().map(({ slug }) => ({ slug }));
}

export const generateMetadata = generateArticleMetadata;

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = articleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="article-page" id="main-content">
      <header className="article-header">
        <p className="article-kicker">
          {article.category} · {article.readingMinutes} 分钟阅读
        </p>
        <h1>{article.title}</h1>
        <p className="article-summary">{article.summary}</p>
        <div className="article-byline">
          <time dateTime={article.updatedAt}>更新于 {article.updatedAt}</time>
          <ul aria-label="文章标签">
            {article.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        </div>
      </header>
      <ArticleBody html={renderMarkdown(article.body)} />
    </main>
  );
}
