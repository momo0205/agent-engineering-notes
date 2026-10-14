import type { Metadata } from "next";
import { reaChapters, reaReviewedAt, reaUpdatedAt, reaRevision, reaReleaseRevision } from "../../../lib/content/rea-topic";

export const metadata: Metadata = {
  title: "REA 工具与逆向工程",
  description: "理解面向 AI Agent 的 REA 逆向工具，沿源码、真实小样本、工程应用与验证分析其能力边界。",
  alternates: { canonical: "/topics/rea" },
};

export default function ReaTopicPage() {
  return (
    <main id="main-content" className="topic-page">
      <header className="topic-hero">
        <p className="eyebrow">专题 · Software investigation</p>
        <h1>REA 工具与逆向工程</h1>
        <p className="topic-lead">REA 是面向 AI Agent 的逆向工程工具系统：让模型借助产物分析、反编译和运行观察，理解软件功能并辅助重建。这里沿源码与一个真实小样本，拆开工具取得的材料、AI 的解释和独立验证。</p>
        <dl className="topic-facts">
          <div><dt>源码版本</dt><dd><code>{reaRevision.slice(0, 8)}</code></dd></div>
          <div><dt>发布基线</dt><dd>6.4.0 · <code>{reaReleaseRevision.slice(0, 8)}</code></dd></div>
          <div><dt>最近审查</dt><dd>{reaReviewedAt}</dd></div>
          <div><dt>内容更新</dt><dd>{reaUpdatedAt}</dd></div>
          <div><dt>研究阶段</dt><dd>源码审查 + 最小 JS 实跑</dd></div>
        </dl>
        <a className="text-link" href={`/topics/rea/${reaChapters[0].slug}`}>从问题与定位开始 →</a>
      </header>
      <section className="jev-question-panel" aria-labelledby="rea-question">
        <p className="eyebrow">Research question</p>
        <h2 id="rea-question">Agent 怎样把观察变成可信的工程结论？</h2>
        <p>分析工具取得的事实、静态推断、模型解释和重建测试，各自能证明什么？REA 提供了一套可以沿源码检查的案例。</p>
        <p>六章以一个教学调查串联：取消导出为什么被当成成功？先用自有 JavaScript 样本实际分析与测试，再解释怎样扩展到 Electron、原生函数和其他工程任务。完整 Electron 场景仍是设计；最小样本的 Mac 失败、Linux 成功和静态 unknown 都如实保留。</p>
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
      <aside className="topic-note"><strong>从源码研究走到最小实跑</strong><p>已完成固定发布版的两份 JS 样本分析、返回形状比较与五项行为对照。它是已知答案的白盒演示，不是盲测或性能评测；原生引擎、真实应用与 MCP 集成实验仍待完成。后续按版本和日期追加证据。<a href="/topics">返回专题研究 →</a></p></aside>
    </main>
  );
}
