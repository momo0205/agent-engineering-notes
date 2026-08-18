import type { Metadata } from "next";
import { articleBySlug } from "../../../lib/content/article-repository";

type ArticleMetadataProps = {
  params: Promise<{ slug: string }>;
};

export async function generateArticleMetadata({
  params,
}: ArticleMetadataProps): Promise<Metadata> {
  const { slug } = await params;
  const article = articleBySlug(slug);

  if (!article) return {};

  return {
    title: article.title,
    description: article.summary,
    alternates: {
      canonical: `/articles/${encodeURIComponent(article.slug)}`,
    },
  };
}
