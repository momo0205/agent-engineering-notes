import { SearchFilter } from "../../components/search-filter";
import { visibleArticles } from "../../lib/content/article-repository";
import { toSearchItems } from "../../lib/content/article-search-items";

export default function ArticlesPage() {
  const articles = toSearchItems(visibleArticles());

  return (
    <main id="main-content">
      <header className="page-intro articles-intro">
        <p className="eyebrow">Published notes</p>
        <h1>文章</h1>
        <p>只展示已经公开发布的学习记录、工程实践与真实复盘。</p>
      </header>
      <SearchFilter articles={articles} />
    </main>
  );
}
