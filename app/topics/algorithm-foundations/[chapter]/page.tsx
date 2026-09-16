import { notFound } from "next/navigation";
import { ArticleBody } from "../../../../components/article-body";
import { AlgorithmProgress } from "../../../../components/algorithm-progress";
import {
  algorithmFoundationsChapter,
  algorithmFoundationsChapters,
  algorithmFoundationsReadingMethodPage,
  algorithmFoundationsRevision,
  type AlgorithmChapter,
} from "../../../../lib/content/algorithm-foundations-topic";
import { renderMarkdown } from "../../../../lib/content/markdown-renderer";

type Props = { params: Promise<{ chapter: string }> };

const statusLabels = {
  learning: "学习中",
  framework: "框架已发布",
  verified: "首轮验证完成",
} as const;

const chapterNames = {
  resnet: "ResNet",
  transformer: "Transformer",
  ddpm: "DDPM",
} as const;

const topicHref = "/topics/algorithm-foundations";
const repositoryTreeHref = `https://github.com/momo0205/paper-deep-dive/tree/${algorithmFoundationsRevision}`;

function isPaperChapter(chapter: ReturnType<typeof algorithmFoundationsChapter>): chapter is AlgorithmChapter {
  return chapter?.kind === "paper";
}

export function generateStaticParams() {
  return [
    { chapter: algorithmFoundationsReadingMethodPage.slug },
    ...algorithmFoundationsChapters.map(({ slug }) => ({ chapter: slug })),
  ];
}

export async function generateMetadata({ params }: Props) {
  const { chapter: slug } = await params;
  const chapter = algorithmFoundationsChapter(slug);
  if (!chapter) return {};

  return {
    title: isPaperChapter(chapter) ? chapter.paperTitle : chapter.title,
    description: chapter.summary,
    alternates: { canonical: `${topicHref}/${chapter.slug}` },
  };
}

export default async function AlgorithmFoundationsChapterPage({ params }: Props) {
  const { chapter: slug } = await params;
  const chapter = algorithmFoundationsChapter(slug);
  if (!chapter) notFound();

  if (!isPaperChapter(chapter)) {
    return (
      <main className="article-page topic-chapter" id="main-content">
        <header className="article-header">
          <nav aria-label="面包屑">
            <a href={topicHref}>算法原理与复现</a> <span aria-hidden="true">/</span> <span>学习方法</span>
          </nav>
          <p className="article-kicker">算法原理与复现专题 · {chapter.order}</p>
          <h1>{chapter.title}</h1>
          <p className="article-summary">{chapter.summary}</p>
          <div className="article-byline">
            <a href={topicHref}>← 返回专题目录</a>
            <a href={`${topicHref}/resnet`}>开始 ResNet →</a>
          </div>
        </header>
        <ArticleBody html={renderMarkdown(chapter.body)} />
      </main>
    );
  }

  const chapterIndex = algorithmFoundationsChapters.findIndex(({ slug: chapterSlug }) => chapterSlug === chapter.slug);
  const previousChapter = algorithmFoundationsChapters[chapterIndex - 1];
  const nextChapter = algorithmFoundationsChapters[chapterIndex + 1];

  return (
    <main className="article-page topic-chapter" id="main-content">
      <header className="article-header">
        <nav aria-label="面包屑">
          <a href={topicHref}>算法原理与复现</a> <span aria-hidden="true">/</span> <span>{chapterNames[chapter.slug as keyof typeof chapterNames]}</span>
        </nav>
        <p className="article-kicker">算法原理与复现专题 · {chapter.order} · arXiv:{chapter.arxivId}{chapter.arxivVersion}</p>
        <h1>{chapter.paperTitle}</h1>
        <p className="article-summary">{chapter.summary}</p>
        <div className="article-byline">
          <span>状态：{statusLabels[chapter.status]}</span>
          <span>代码版本 <code>{algorithmFoundationsRevision.slice(0, 8)}</code></span>
        </div>
      </header>

      <section className="topic-note" aria-labelledby="official-paper-title">
        <strong id="official-paper-title">官方原文</strong>
        <p>
          本站不镜像论文 PDF。即使官方 PDF 暂时不可访问，仍可通过以下普通链接阅读摘要或稍后重试 PDF。
          <br />
          <a href={chapter.abstractUrl}>官方 abstract</a>
          {" · "}
          <a href={chapter.pdfUrl}>官方 PDF</a>
          {" · "}
          <a href={repositoryTreeHref}>查看固定版本源码</a>
        </p>
      </section>

      <ArticleBody html={renderMarkdown(chapter.body)} />

      <AlgorithmProgress
        chapter={chapter.slug}
        chapterName={chapterNames[chapter.slug as keyof typeof chapterNames]}
      />

      <nav className="topic-note" aria-label="章节导航">
        <strong>课程导航</strong>
        <p>
          {previousChapter ? (
            <a href={`${topicHref}/${previousChapter.slug}`}>
              上一篇：{chapterNames[previousChapter.slug as keyof typeof chapterNames]}
            </a>
          ) : (
            "已是第一篇论文"
          )}
          {previousChapter && nextChapter ? " · " : null}
          {nextChapter ? (
            <a href={`${topicHref}/${nextChapter.slug}`}>
              下一篇：{chapterNames[nextChapter.slug as keyof typeof chapterNames]}
            </a>
          ) : (
            previousChapter ? "已是最后一篇论文" : null
          )}
        </p>
      </nav>
    </main>
  );
}
