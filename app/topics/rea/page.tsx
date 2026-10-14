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
        <p className="topic-lead">没有完整源码时，AI 怎样接触真实的软件，而不是只给出一段合理解释？从 REA 的作用与分工建立整体认识，再沿源码、证据和实践，理解工具材料怎样支撑可验证的判断。</p>
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
        <p>六章沿“定位与分工 → 源码架构 → 证据判断 → 工程用途 → 入门实践 → 接入决策”逐步展开。完整应用案例留待后续选题；现有 JavaScript 实跑仅作为实践章的小样本练习，保留 Mac 失败、Linux 成功和静态 unknown，不将它当作整个专题的贯穿案例。</p>
        <p>初次阅读先看<a href="/topics/rea/what-is-rea">总览与学习主线</a>；需要查证时进入<a href="/topics/rea/source-architecture">源码索引</a>，动手时从<a href="/topics/rea/hands-on">行为对照与实践命令</a>开始。同一套资料既解释为什么，也留下可以继续核查和复现的细节。</p>
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
