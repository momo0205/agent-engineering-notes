import type { Metadata } from "next";
import { reaChapters, reaReviewedAt, reaRevision, reaReleaseRevision } from "../../../lib/content/rea-topic";

export const metadata: Metadata = {
  title: "REA 工具与逆向工程",
  description: "从固定源码分析 REA 的 AI 分工、MCP、证据、工程用途与实践边界。",
  alternates: { canonical: "/topics/rea" },
};

export default function ReaTopicPage() {
  return (
    <main id="main-content" className="topic-page">
      <header className="topic-hero">
        <p className="eyebrow">专题 · Software investigation</p>
        <h1>REA 工具与逆向工程</h1>
        <p className="topic-lead">让 Agent 接触真实的软件产物，再追问它怎样取得事实、解释结果和验证实现。从 AI 的分工开始，沿源码走进证据与工程判断。</p>
        <dl className="topic-facts">
          <div><dt>源码版本</dt><dd><code>{reaRevision.slice(0, 8)}</code></dd></div>
          <div><dt>发布基线</dt><dd>6.4.0 · <code>{reaReleaseRevision.slice(0, 8)}</code></dd></div>
          <div><dt>最近审查</dt><dd>{reaReviewedAt}</dd></div>
          <div><dt>研究阶段</dt><dd>首轮源码审查完成 · 实跑待完成</dd></div>
        </dl>
        <a className="text-link" href={`/topics/rea/${reaChapters[0].slug}`}>从问题与定位开始 →</a>
      </header>
      <section className="jev-question-panel" aria-labelledby="rea-question">
        <p className="eyebrow">Research question</p>
        <h2 id="rea-question">Agent 怎样把观察变成可信的工程结论？</h2>
        <p>分析工具取得的事实、静态推断、模型解释和重建测试，各自能证明什么？REA 提供了一套可以沿源码检查的案例。</p>
      </section>
      <section className="topic-map" aria-labelledby="rea-chapters">
        <div className="section-heading"><h2 id="rea-chapters">研究与实践路径</h2><span>6 章 · 持续更新</span></div>
        <div className="topic-grid">
          {reaChapters.map((chapter) => (
            <article key={chapter.slug}>
              <p>{chapter.order} · {chapter.readingMinutes} 分钟</p>
              <h3><a href={`/topics/rea/${chapter.slug}`}>{chapter.title}</a></h3>
              <p>{chapter.summary}</p>
              <a href={`/topics/rea/${chapter.slug}`} aria-label={`阅读：${chapter.title}`}>阅读章节 →</a>
            </article>
          ))}
        </div>
      </section>
      <aside className="topic-note"><strong>证据状态</strong><p>本轮完成源码、文档和测试设计审查；教程及外部引擎尚未本机实跑。后续实验按日期和版本追加，保留失败与修正记录。<a href="/topics">返回专题研究 →</a></p></aside>
    </main>
  );
}
