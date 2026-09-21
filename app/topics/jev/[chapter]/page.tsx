import { notFound } from "next/navigation";
import { ArticleBody } from "../../../../components/article-body";
import {
  jevChapter,
  jevChapters,
  type EvidenceLevel,
  type JevChapterStatus,
} from "../../../../lib/content/jev-topic";
import { renderMarkdown } from "../../../../lib/content/markdown-renderer";

type Props = { params: Promise<{ chapter: string }> };

const topicHref = "/topics/jev";

const evidenceLabels: Record<EvidenceLevel, string> = {
  "official-fact": "官方事实",
  "vendor-claim": "厂商声明",
  "third-party": "第三方观察",
  "local-reproduction": "本地复现",
  provisional: "暂时判断",
  unresolved: "未解决",
  overturned: "已推翻",
};

const statusLabels: Record<JevChapterStatus, string> = {
  research: "研究中",
  verified: "已验证",
  "experiment-pending": "等待实验",
};

export function generateStaticParams() {
  return jevChapters.map(({ slug }) => ({ chapter: slug }));
}

export async function generateMetadata({ params }: Props) {
  const { chapter: slug } = await params;
  const chapter = jevChapter(slug);
  if (!chapter) return {};

  return {
    title: chapter.title,
    description: chapter.summary,
    alternates: { canonical: `${topicHref}/${chapter.slug}` },
  };
}

export default async function JevChapterPage({ params }: Props) {
  const { chapter: slug } = await params;
  const chapter = jevChapter(slug);
  if (!chapter) notFound();

  const chapterIndex = jevChapters.findIndex(({ slug: itemSlug }) => itemSlug === chapter.slug);
  const previousChapter = jevChapters[chapterIndex - 1];
  const nextChapter = jevChapters[chapterIndex + 1];

  return (
    <main className="article-page topic-chapter" id="main-content">
      <header className="article-header">
        <nav aria-label="面包屑">
          <a href={topicHref}>Jev 研究专题</a> <span aria-hidden="true">/</span> <span>{chapter.order}</span>
        </nav>
        <p className="article-kicker">Jev 无文本决策模型研究 · {chapter.order}</p>
        <h1>{chapter.title}</h1>
        <p className="article-summary">{chapter.summary}</p>
      </header>

      <section className="jev-chapter-evidence" aria-label="研究证据摘要">
        <dl>
          <div><dt>研究状态</dt><dd>{statusLabels[chapter.status]}</dd></div>
          <div><dt>证据级别</dt><dd>{chapter.evidenceLevels.map((level) => evidenceLabels[level]).join(" · ")}</dd></div>
          <div><dt>最近审阅</dt><dd>{chapter.reviewedAt}</dd></div>
          <div><dt>模型版本</dt><dd><code>{chapter.modelVersion}</code></dd></div>
        </dl>
        {chapter.localExperiment === "not-started" ? (
          <p role="status"><strong>实验尚未开始</strong>：本章没有把计划或厂商结果写成本地验证。</p>
        ) : null}
      </section>

      <ArticleBody html={renderMarkdown(chapter.body)} />

      <nav className="topic-note" aria-label="章节导航">
        <strong>专题导航</strong>
        <p>
          {previousChapter ? (
            <a href={`${topicHref}/${previousChapter.slug}`}>上一篇：{previousChapter.title}</a>
          ) : "已是第一章"}
          {previousChapter && nextChapter ? " · " : null}
          {nextChapter ? (
            <a href={`${topicHref}/${nextChapter.slug}`}>下一篇：{nextChapter.title}</a>
          ) : previousChapter ? "已是最后一章" : null}
          <br />
          <a href={topicHref}>← 返回 Jev 专题目录</a>
        </p>
      </nav>
    </main>
  );
}
