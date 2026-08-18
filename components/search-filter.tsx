"use client";

import { useState } from "react";
import { ArticleCard } from "./article-card";
import type { ArticleMetadata } from "../lib/content/article-schema";
import { searchArticles } from "../lib/content/search-index";

export type SearchArticleMetadata = Pick<
  ArticleMetadata,
  "category" | "readingMinutes" | "summary" | "title"
> & { slug: string; tags: readonly string[] };

export function SearchFilter({
  articles,
}: {
  articles: readonly SearchArticleMetadata[];
}) {
  const [query, setQuery] = useState("");
  const matches = searchArticles(articles, query);

  return (
    <section className="article-browser" aria-labelledby="article-list-title">
      <div className="search-field">
        <label htmlFor="article-search">搜索文章</label>
        <input
          id="article-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="按标题、摘要或标签搜索"
        />
      </div>
      <h2 id="article-list-title" className="sr-only">文章列表</h2>
      {matches.length > 0 ? (
        <div className="article-list">
          {matches.map((article) => (
            <ArticleCard key={article.slug} {...article} />
          ))}
        </div>
      ) : (
        <p className="empty-state" role="status">没有找到匹配的文章。</p>
      )}
    </section>
  );
}
