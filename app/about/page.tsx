export default function AboutPage() {
  return (
    <main id="main-content">
      <header className="page-intro about-intro">
        <p className="eyebrow">About the notes</p>
        <h1>关于本站</h1>
        <p>
          我来自 Java 后端工程背景，正在把已有的系统工程经验带进 Agent 开发，
          也诚实记录概念变成代码时的理解、实验与失败。
        </p>
      </header>

      <section className="page-section about-grid" aria-labelledby="purpose-title">
        <div>
          <p className="section-kicker">记录目的</p>
          <h2 id="purpose-title">保留判断形成的过程</h2>
          <p>这里关注实际做过什么、证据支持什么，以及结论暂时不能覆盖什么。</p>
        </div>
        <div className="policy-card">
          <h2>公开内容政策</h2>
          <ul>
            <li>发布前完成脱敏，不披露凭据或私人基础设施信息。</li>
            <li>只发布明确进入 public repo 的内容。</li>
            <li>每项结论说明证据与边界，不把局部实验包装成普遍事实。</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
