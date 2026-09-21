/* eslint-disable @next/next/no-html-link-for-pages -- vinext does not provide next/link */
import { notFound } from "next/navigation";
import { ArticleBody } from "../../../../components/article-body";
import {
  deepSeekHarnessChapter,
  deepSeekHarnessChapters,
  deepSeekHarnessRevision,
} from "../../../../lib/content/deepseek-harness-topic";
import { renderMarkdown } from "../../../../lib/content/markdown-renderer";

type Props = { params: Promise<{ chapter: string }> };

export function generateStaticParams() {
  return deepSeekHarnessChapters.map(({ slug }) => ({ chapter: slug }));
}

export async function generateMetadata({ params }: Props) {
  const { chapter: slug } = await params;
  const chapter = deepSeekHarnessChapter(slug);
  if (!chapter) return {};
  return {
    title: chapter.title,
    description: chapter.summary,
    alternates: { canonical: `/topics/deepseek-harness/${chapter.slug}` },
  };
}

export default async function DeepSeekHarnessChapterPage({ params }: Props) {
  const { chapter: slug } = await params;
  const chapter = deepSeekHarnessChapter(slug);
  if (!chapter) notFound();

  return (
    <main className="article-page topic-chapter" id="main-content">
      <header className="article-header">
        <p className="article-kicker">DeepSeek Harness 专题 · {chapter.order}</p>
        <h1>{chapter.title}</h1>
        <p className="article-summary">{chapter.summary}</p>
        <div className="article-byline">
          <a href="/topics/deepseek-harness">← 返回专题目录</a>
          <span>源码版本 <code>{deepSeekHarnessRevision.slice(0, 8)}</code></span>
        </div>
      </header>
      <ArticleBody html={renderMarkdown(chapter.body)} />
    </main>
  );
}
