/* eslint-disable @next/next/no-html-link-for-pages -- vinext does not provide next/link */
import { notFound } from "next/navigation";
import { ArticleBody } from "../../../../components/article-body";
import { reaChapter, reaChapters, reaReviewedAt, reaUpdatedAt, reaRevision } from "../../../../lib/content/rea-topic";
import { renderMarkdown } from "../../../../lib/content/markdown-renderer";

type Props = { params: Promise<{ chapter: string }> };

export function generateStaticParams() {
  return reaChapters.map(({ slug }) => ({ chapter: slug }));
}

export async function generateMetadata({ params }: Props) {
  const { chapter: slug } = await params;
  const chapter = reaChapter(slug);
  if (!chapter) return {};
  return { title: chapter.title, description: chapter.summary, alternates: { canonical: `/topics/rea/${chapter.slug}` } };
}

export default async function ReaChapterPage({ params }: Props) {
  const { chapter: slug } = await params;
  const chapter = reaChapter(slug);
  if (!chapter) notFound();
  const index = reaChapters.findIndex((item) => item.slug === slug);
  const previous = reaChapters[index - 1];
  const next = reaChapters[index + 1];
  return (
    <main id="main-content" className="article-page topic-chapter">
      <header className="article-header">
        <nav aria-label="面包屑"><a href="/topics">专题研究</a> / <a href="/topics/rea">REA 工具与逆向工程</a></nav>
        <p className="article-kicker">REA 研究 · {chapter.order} · {chapter.readingMinutes} 分钟</p>
        <h1>{chapter.title}</h1><p className="article-summary">{chapter.summary}</p>
      </header>
      <section className="jev-chapter-evidence" aria-label="研究证据摘要">
        <dl>
          <div><dt>研究状态</dt><dd>源码研究</dd></div>
          <div><dt>证据类型</dt><dd>源码与测试设计 · 工程判断</dd></div>
          <div><dt>源码版本</dt><dd><a href={`https://github.com/morluto/rea/tree/${reaRevision}`}><code>{reaRevision.slice(0, 8)}</code></a></dd></div>
          <div><dt>最近审查</dt><dd>{reaReviewedAt}</dd></div>
          <div><dt>内容更新</dt><dd>{reaUpdatedAt}</dd></div>
        </dl>
        <p role="status">已完成首轮源码审查；教程与外部分析引擎尚未本机实跑。发布版 6.4.0 与审查的 main 源码分别标注。</p>
      </section>
      <ArticleBody html={renderMarkdown(chapter.body)} />
      <nav className="topic-note" aria-label="章节导航">
        <strong>继续阅读</strong>
        <p>
          {previous ? <><a href={`/topics/rea/${previous.slug}`}>上一篇：{previous.title}</a><br /></> : null}
          {next ? <><a href={`/topics/rea/${next.slug}`}>下一篇：{next.title}</a><br /></> : null}
          <a href="/topics/rea">返回 REA 专题目录 →</a>
        </p>
      </nav>
    </main>
  );
}
