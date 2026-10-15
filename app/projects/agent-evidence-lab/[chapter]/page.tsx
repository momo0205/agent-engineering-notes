import { notFound } from "next/navigation";
import { ArticleBody } from "../../../../components/article-body";
import { evidenceLabBasePath, evidenceLabChapter, evidenceLabChapters, evidenceLabReviewedAt, evidenceLabRevision } from "../../../../lib/content/evidence-lab";
import { renderMarkdown } from "../../../../lib/content/markdown-renderer";

type Props = { params: Promise<{ chapter: string }> };
export function generateStaticParams() {
  return evidenceLabChapters.map(({ slug }) => ({ chapter: slug }));
}
export async function generateMetadata({ params }: Props) {
  const chapter = evidenceLabChapter((await params).chapter);
  return chapter ? { title: chapter.title, description: chapter.summary, alternates: { canonical: `${evidenceLabBasePath}/${chapter.slug}` } } : {};
}
export default async function EvidenceLabChapterPage({ params }: Props) {
  const chapter = evidenceLabChapter((await params).chapter);
  if (!chapter) notFound();
  const index = evidenceLabChapters.findIndex((item) => item.slug === chapter.slug);
  const previous = evidenceLabChapters[index - 1];
  const next = evidenceLabChapters[index + 1];
  return <main id="main-content" className="article-page topic-chapter">
    <header className="article-header">
      <nav aria-label="面包屑"><a href={evidenceLabBasePath}>Agent Evidence Lab</a> / 研究与实现</nav>
      <p className="article-kicker">研究 Agent 的 Agent · {chapter.order} · {chapter.readingMinutes} 分钟</p>
      <h1>{chapter.title}</h1><p className="article-summary">{chapter.summary}</p>
    </header>
    <section className="jev-chapter-evidence" aria-label="实现与证据基线">
      <dl>
        <div><dt>实现核对</dt><dd><code>{evidenceLabRevision}</code> · 已合并 main</dd></div>
        <div><dt>核对日期</dt><dd>{evidenceLabReviewedAt}</dd></div>
        <div><dt>证据类型</dt><dd>源码 · 版本化验收 · 工程解释</dd></div>
      </dl>
      <p>本地固定范围验收与单一真实样本分别说明；示意代码不能直接部署，后续设计不视为已实现。</p>
    </section>
    <ArticleBody profile="evidence-lab" html={renderMarkdown(chapter.body)} />
    <nav className="topic-note" aria-label="章节导航"><strong>继续阅读</strong><p>
      {previous ? <><a href={`${evidenceLabBasePath}/${previous.slug}`}>上一篇：{previous.title}</a><br /></> : null}
      {next ? <><a href={`${evidenceLabBasePath}/${next.slug}`}>下一篇：{next.title}</a><br /></> : null}
      <a href={evidenceLabBasePath}>返回项目总览 →</a>
    </p></nav>
  </main>;
}
