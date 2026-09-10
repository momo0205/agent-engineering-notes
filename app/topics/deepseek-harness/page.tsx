import type { Metadata } from "next";
import {
  deepSeekHarnessChapters,
  deepSeekHarnessReviewedAt,
  deepSeekHarnessRevision,
} from "../../../lib/content/deepseek-harness-topic";

export const metadata: Metadata = {
  title: "DeepSeek Harness 源码与能力边界",
  description: "基于固定源码版本分析 DeepSeek Harness 的 Agent Loop、插件架构、上下文、安全边界与接入价值。",
  alternates: { canonical: "/topics/deepseek-harness" },
};

export default function DeepSeekHarnessTopicPage() {
  return (
    <main id="main-content" className="topic-page">
      <header className="topic-hero">
        <p className="eyebrow">专题 · Source review</p>
        <h1>DeepSeek Harness 源码与能力边界</h1>
        <p className="topic-lead">
          不复述产品宣传，也不把“能接工具”写成“可以可靠完成任何任务”。这个专题从真实源码出发，区分模型能力、Harness 机制、外部依赖和无法保证的部分。
        </p>
        <dl className="topic-facts">
          <div><dt>分析版本</dt><dd><code>{deepSeekHarnessRevision.slice(0, 8)}</code></dd></div>
          <div><dt>源码日期</dt><dd>{deepSeekHarnessReviewedAt}</dd></div>
          <div><dt>成熟度</dt><dd>Developer Preview</dd></div>
          <div><dt>当前决策</dt><dd>不替换 Agent Evidence Lab</dd></div>
        </dl>
        <a className="text-link" href={`/topics/deepseek-harness/capability-boundary`}>
          先读能力边界 <span aria-hidden="true">→</span>
        </a>
      </header>

      <section className="topic-map" aria-labelledby="topic-map-title">
        <div className="section-heading">
          <h2 id="topic-map-title">阅读顺序</h2>
          <a href="https://github.com/deepseek-ai/deepseek-harness/tree/aa8262ec091698bae9a6b04773a6b5b06ad4aef2">查看对应源码</a>
        </div>
        <div className="topic-grid">
          {deepSeekHarnessChapters.map((chapter) => (
            <article key={chapter.slug}>
              <p>{chapter.order} · {chapter.readingMinutes} 分钟</p>
              <h2><a href={`/topics/deepseek-harness/${chapter.slug}`}>{chapter.title}</a></h2>
              <p>{chapter.summary}</p>
              <a aria-label={`阅读：${chapter.title}`} href={`/topics/deepseek-harness/${chapter.slug}`}>阅读章节 →</a>
            </article>
          ))}
        </div>
      </section>

      <aside className="topic-note">
        <strong>研究口径</strong>
        <p>本文讨论的是工程能力，不评价模型智力排名。源码仍在快速迭代，后续版本可能改变接口和实现；专题中的结论都绑定到上面的 commit。</p>
      </aside>
    </main>
  );
}
