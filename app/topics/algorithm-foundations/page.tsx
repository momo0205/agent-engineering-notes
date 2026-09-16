import type { Metadata } from "next";
import {
  algorithmFoundationsChapters,
  algorithmFoundationsRevision,
  algorithmFoundationsReviewedAt,
} from "../../../lib/content/algorithm-foundations-topic";

export const metadata: Metadata = {
  title: "算法原理与复现",
  description: "按课程顺序阅读 ResNet、Transformer 和 DDPM，沿着问题、原文、推导、复现、实验与自测完成学习闭环。",
  alternates: { canonical: "/topics/algorithm-foundations" },
};

const statusLabels = {
  learning: "学习中",
  framework: "框架已发布",
  verified: "首轮验证完成",
} as const;

const chapterDisplayNames = {
  resnet: "ResNet",
  transformer: "Transformer",
  ddpm: "DDPM",
} as const;

const relationshipNodes = [
  {
    slug: "resnet",
    title: "ResNet",
    description: "改善深层网络中的信息与梯度传递。",
  },
  {
    slug: "transformer",
    title: "Transformer",
    description: "用残差结构承载多层注意力和前馈计算。",
  },
  {
    slug: "ddpm",
    title: "DDPM",
    description: "在去噪网络中继续使用残差块，并可引入注意力。",
  },
] as const;

const learningLoop = ["问题", "原文", "推导", "复现", "实验", "自测"] as const;
const readingMethodHref = "/topics/algorithm-foundations/reading-method";
const resnetHref = "/topics/algorithm-foundations/resnet";

export default function AlgorithmFoundationsTopicPage() {
  const publicRepositoryTree = `https://github.com/momo0205/paper-deep-dive/tree/${algorithmFoundationsRevision}`;

  return (
    <main id="main-content" className="topic-page">
      <header className="topic-hero">
        <p className="eyebrow">专题 · Algorithm foundations</p>
        <h1>算法原理与复现</h1>
        <p className="topic-lead">
          用三篇论文补上算法基础：从残差连接、注意力到扩散去噪，沿着可运行的最小复现理解模型为什么这样工作。
          这里记录真实的学习进度，不把尚未验证的解释写成结论。
        </p>
        <dl className="topic-facts">
          <div><dt>课程章节</dt><dd>3 篇论文</dd></div>
          <div><dt>内容状态</dt><dd>1 篇学习中 · 2 篇框架</dd></div>
          <div><dt>代码版本</dt><dd><code>{algorithmFoundationsRevision.slice(0, 8)}</code></dd></div>
          <div><dt>最近审阅</dt><dd>{algorithmFoundationsReviewedAt}</dd></div>
        </dl>
        <a className="text-link" href={resnetHref}>
          继续学习：ResNet <span aria-hidden="true">→</span>
        </a>
      </header>

      <section className="topic-map" aria-label="算法课程学习路径">
        <div className="section-heading">
          <h2 id="algorithm-learning-path-title">学习路径</h2>
          <a href={readingMethodHref}>学习方法 <span aria-hidden="true">→</span></a>
        </div>
        <div className="topic-grid algorithm-course-grid">
          {algorithmFoundationsChapters.map((chapter) => (
            <article key={chapter.slug}>
              <p>{chapter.order} · {chapter.readingMinutes} 分钟</p>
              <h3><a href={`/topics/algorithm-foundations/${chapter.slug}`}>{chapterDisplayNames[chapter.slug as keyof typeof chapterDisplayNames]}</a></h3>
              <p>{chapter.summary}</p>
              <p className="algorithm-topic-status">状态：{chapterDisplayNames[chapter.slug as keyof typeof chapterDisplayNames]} · {statusLabels[chapter.status]}</p>
              <a href={`/topics/algorithm-foundations/${chapter.slug}`} aria-label={`阅读章节：${chapterDisplayNames[chapter.slug as keyof typeof chapterDisplayNames]}`}>
                进入章节 <span aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="algorithm-topic-relationships" aria-labelledby="algorithm-relationships-title">
        <div className="section-heading">
          <h2 id="algorithm-relationships-title">三篇论文不是孤岛</h2>
          <a href={publicRepositoryTree}>查看固定版本源码 <span aria-hidden="true">↗</span></a>
        </div>
        <p className="algorithm-topic-question">
          信息如何在越来越深、越来越复杂的模型中稳定流动？这是一条帮助建立联系的阅读线索，不暗示三篇论文构成严格的线性技术演进。
        </p>
        <ol className="algorithm-topic-relationship">
          {relationshipNodes.map((node) => (
            <li className="algorithm-topic-relationship-node" key={node.title}>
              <h3><a href={`/topics/algorithm-foundations/${node.slug}`}>{node.title}</a></h3>
              <p>{node.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="algorithm-topic-loop" aria-labelledby="algorithm-loop-title">
        <div className="section-heading">
          <h2 id="algorithm-loop-title">学习循环</h2>
          <a href={readingMethodHref}>打开阅读方法 <span aria-hidden="true">→</span></a>
        </div>
        <ol className="algorithm-topic-loop-list">
          {learningLoop.map((step, index) => (
            <li key={step}>
              <span aria-hidden="true">0{index + 1}</span>
              <strong>{step}</strong>
            </li>
          ))}
        </ol>
        <p className="algorithm-topic-loop-note">每一轮都留下可追溯的来源、运行命令和边界；实验结果不能替代论文结论。</p>
      </section>

      <section className="algorithm-topic-progress" aria-labelledby="algorithm-progress-title">
        <h2 id="algorithm-progress-title">本地进度</h2>
        <div role="status">
          <strong>进度占位</strong>
          <p>专题进度功能正在整理，当前不会自动保存或同步任何数据。</p>
          <p>未来状态仅保存在当前浏览器；浏览器存储不可用时，会退化为当前会话状态。</p>
        </div>
      </section>

      <aside className="topic-note">
        <strong>公开边界</strong>
        <p>论文原文通过官方 arXiv 页面阅读；代码与实验记录固定到上面的 GitHub tree revision。尚未完成的推导和实验解释会明确标记为未形成公开结论。</p>
      </aside>
    </main>
  );
}
