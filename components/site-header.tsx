/* eslint-disable @next/next/no-html-link-for-pages -- vinext does not provide next/link */
export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">跳到正文</a>
      <a className="site-brand" href="/" aria-label="Agent 工程笔记首页">
        Agent 工程笔记
      </a>
      <nav aria-label="主导航">
        <a href="/">首页</a>
        <a href="/journey">学习路径</a>
        <a href="/articles">文章</a>
        <a href="/projects/agent-evidence-lab">项目</a>
        <a href="/about">关于</a>
      </nav>
    </header>
  );
}
