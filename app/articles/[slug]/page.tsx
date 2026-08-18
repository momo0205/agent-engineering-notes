import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article-body";
import {
  articleBySlug,
  visibleArticles,
} from "@/lib/content/article-repository";
import { renderMarkdown } from "@/lib/content/markdown-renderer";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return visibleArticles().map(({ slug }) => ({ slug }));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = articleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <main id="main-content">
      <header>
        <p>
          {article.category} · {article.readingMinutes} 分钟阅读
        </p>
        <h1>{article.title}</h1>
        <p>{article.summary}</p>
      </header>
      <ArticleBody html={renderMarkdown(article.body)} />
    </main>
  );
}
