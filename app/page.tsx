/* eslint-disable @next/next/no-html-link-for-pages -- vinext does not provide next/link */
import { visibleArticles } from "../lib/content/article-repository";

const editorialTeasers = [
  {
    category: "学习路径",
    title: "从 Java 后端到 Agent 开发，技术栈到底变了什么",
  },
  {
    category: "工程实践",
    title: "第一个受约束 Agent Loop：完成了什么，还缺什么",
  },
  {
    category: "真实复盘",
    title: "为什么模型把“明确反对”判断成了支持",
  },
] as const;

export default function Home() {
  const articles = visibleArticles().slice(0, 3);

  return (
    <main id="main-content">
      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">一名 Java 工程师的 Agent 学习现场</p>
        <h1 id="hero-title">
          我在学习怎样造出真正能工作的 Agent。
          <span>这里记录一路上的代码、失败和判断。</span>
        </h1>
        <p className="hero-intro">
          这个网站不是 AI 名词收藏夹，而是我从调用模型开始，逐步理解上下文、工具、循环、评测和部署的真实过程。
        </p>
        <a className="text-link" href="/articles">
          从第一篇开始阅读 <span aria-hidden="true">→</span>
        </a>
      </section>

      <section className="feature" aria-labelledby="feature-title">
        <div className="feature-kicker">
          <span className="feature-status"><i aria-hidden="true" />正在进行</span>
          <span>Agent Evidence Lab</span>
        </div>
        <h2 id="feature-title">
          Agent = LLM + Context + Harness。
          <span>这三个部分，在代码里究竟长什么样？</span>
        </h2>
        <div className="feature-footer">
          <p>从真实代码理解一个 Agent 的基本组成</p>
          <a href="/articles">阅读当前章节 <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <section className="stories" aria-labelledby="stories-title">
        <div className="section-heading">
          <h2 id="stories-title">最近写下的东西</h2>
          <a href="/articles">查看全部文章 <span aria-hidden="true">→</span></a>
        </div>
        <div className="story-grid">
          {editorialTeasers.map((teaser, index) => {
            const article = articles[index];

            return article ? (
              <article className={`story-card story-card-${index + 1}`} key={article.slug}>
                <p className="story-meta">
                  {article.category} · {article.readingMinutes} 分钟阅读
                </p>
                <h3><a href={`/articles/${article.slug}`}>{article.title}</a></h3>
                <span className="story-arrow" aria-hidden="true">→</span>
              </article>
            ) : (
              <article className={`story-card story-card-${index + 1}`} key={teaser.title}>
                <p className="story-meta">{teaser.category} · 即将整理</p>
                <h3>{teaser.title}</h3>
                <span className="story-arrow" aria-hidden="true">↗</span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="writing-note" aria-labelledby="writing-note-title">
        <h2 id="writing-note-title">为什么写下来</h2>
        <p>记录不是为了证明我早就知道答案，而是保留那些答案尚不清楚时，真正做过的选择和验证。</p>
      </section>
    </main>
  );
}
