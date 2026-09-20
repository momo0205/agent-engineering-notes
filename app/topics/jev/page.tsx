import type { Metadata } from "next";
import {
  jevChapters,
  jevModelVersion,
  jevReviewedAt,
} from "../../../lib/content/jev-topic";

export const metadata: Metadata = {
  title: "Jev：无文本决策模型研究",
  description: "审计 Jev 的接口、能力边界、性能声明与实验方法，并提供安全的实践入口。",
  alternates: { canonical: "/topics/jev" },
};

export default function JevTopicPage() {
  return (
    <main id="main-content" className="topic-page">
      <header className="topic-hero">
        <p className="eyebrow">专题 · Decision model research</p>
        <h1>Jev：无文本决策模型研究</h1>
        <p className="topic-lead">
          它不写长答案，只返回程序可以消费的类型化决策和概率。这里不急着相信“更快、更便宜”，而是先分清接口事实、厂商声明和仍待实验的问题。
        </p>
        <dl className="topic-facts">
          <div><dt>研究状态</dt><dd>研究进行中</dd></div>
          <div><dt>跟踪版本</dt><dd><code>{jevModelVersion}</code></dd></div>
          <div><dt>最近审阅</dt><dd>{jevReviewedAt}</dd></div>
          <div><dt>本地验证</dt><dd>实验尚未开始</dd></div>
        </dl>
        <a className="text-link" href={`/topics/jev/${jevChapters[0].slug}`}>
          从研究动机开始 <span aria-hidden="true">→</span>
        </a>
      </header>

      <section className="jev-question-panel" aria-labelledby="jev-question-title">
        <p className="eyebrow">Research question</p>
        <h2 id="jev-question-title">核心研究问题</h2>
        <p>
          当运行时只消费最终分支时，生成文本只是给人看的接口成本，还是模型完成复杂判断所需的工作区？去掉自由文本之后，速度、成本、正确率和可诊断性分别发生什么变化？
        </p>
      </section>

      <section className="jev-current-view" aria-labelledby="jev-current-title">
        <div className="section-heading"><h2 id="jev-current-title">当前判断</h2></div>
        <div className="jev-evidence-row">
          <p><span className="jev-evidence-badge">官方事实</span> API 接受状态与预定义问题，返回 Choice、Score 或 Noul 类型的概率答案。</p>
          <p><span className="jev-evidence-badge is-claim">厂商声明</span> 新架构、并行 sampler、RLCD 与公开性能数字仍需要独立复核。</p>
          <p><span className="jev-evidence-badge is-provisional">暂时判断</span> Jev 是窄接口决策组件，不是 Agent、生成式 LLM 或确定性规则的统一替代品。</p>
        </div>
      </section>

      <section className="topic-map" aria-labelledby="jev-map-title">
        <div className="section-heading">
          <h2 id="jev-map-title">研究与实践路径</h2>
          <span>首发 6 章 · 持续更新</span>
        </div>
        <div className="topic-grid">
          {jevChapters.map((chapter) => (
            <article key={chapter.slug}>
              <p>{chapter.order} · {chapter.readingMinutes} 分钟</p>
              <h2><a href={`/topics/jev/${chapter.slug}`}>{chapter.title}</a></h2>
              <p>{chapter.summary}</p>
              <a aria-label={`阅读：${chapter.title}`} href={`/topics/jev/${chapter.slug}`}>阅读章节 →</a>
            </article>
          ))}
        </div>
      </section>

      <section className="jev-open-questions" aria-labelledby="jev-open-title">
        <div>
          <p className="eyebrow">Open questions</p>
          <h2 id="jev-open-title">开放问题</h2>
        </div>
        <ul>
          <li>未公开架构究竟保留了怎样的内部计算能力？</li>
          <li>RLCD 的目标和训练细节能否被独立复核？</li>
          <li>厂商概率在中文与真实业务分布中是否仍然校准？</li>
          <li>从原子判断推广到复杂工作流时，误差怎样累积？</li>
        </ul>
      </section>

      <aside className="topic-note">
        <strong>研究政策</strong>
        <p>所有结论绑定证据状态、审阅日期与模型版本。后续实验可以补强，也可以推翻当前判断；旧结论不会被静默覆盖。</p>
      </aside>
    </main>
  );
}
