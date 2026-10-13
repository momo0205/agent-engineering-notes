"use client";

import { useState } from "react";
import type { ResearchTopicGroup } from "../lib/content/research-topics";
import { searchArticles } from "../lib/content/search-index";

export function TopicDirectory({ groups }: { groups: readonly ResearchTopicGroup[] }) {
  const [query, setQuery] = useState("");
  const matches = groups.map((group) => ({ ...group, topics: searchArticles(group.topics, query) }));
  const count = matches.reduce((total, group) => total + group.topics.length, 0);

  return (
    <div>
      <section className="topic-map" aria-label="专题搜索">
        <div className="search-field">
          <label htmlFor="topic-search">搜索专题</label>
          <input id="topic-search" type="search" value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="按主题、问题或技术搜索" />
        </div>
        <p className={count === 0 ? "empty-state" : "topic-search-status"} role="status" aria-live="polite">
          {count === 0 ? "没有找到匹配的专题。可以试试其他关键词。" : `${count} 个专题`}
        </p>
      </section>
      {matches.filter((group) => group.topics.length > 0).map((group) => (
        <section className="topic-map" key={group.id} aria-labelledby={`${group.id}-title`}>
          <div className="section-heading"><h2 id={`${group.id}-title`}>{group.title}</h2></div>
          <p className="topic-group-intro">{group.summary}</p>
          <div className="topic-grid">
            {group.topics.map((topic) => (
              <article key={topic.href}>
                <p>{topic.progress}</p>
                <h3><a href={topic.href}>{topic.title}</a></h3>
                <p>{topic.summary}</p>
                <a href={topic.href} aria-label={`进入专题：${topic.title}`}>进入专题 →</a>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
