import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  allArticles,
  articleBySlug,
  parseArticle,
  visibleArticles,
} from "../../lib/content/article-repository";
import type { Article } from "../../lib/content/article-schema";

const source = (status: Article["status"], updatedAt = "2026-08-18") => `---
title: 从 Java 后端到 Agent 开发
summary: 技术栈变化与学习路径。
status: ${status}
category: 学习路径
publishedAt: "2026-08-18"
updatedAt: "${updatedAt}"
readingMinutes: 12
tags:
  - Java
  - Agent
---

  正文内容。
`;

describe("article repository", () => {
  it("loads deployable articles from sources bundled with the application", () => {
    expect(allArticles().map(({ slug }) => slug)).toEqual([
      "agent-llm-context-harness",
      "bounded-agent-loop",
      "java-to-agent",
      "java-vs-python-worker",
      "stance-misclassification",
    ]);
  });

  it("parses complete frontmatter and derives the slug from the filename", () => {
    const article = parseArticle("java-to-agent.md", source("published"));

    expect(article.slug).toBe("java-to-agent");
    expect(article.body).toBe("正文内容。");
  });

  it.each([".md", "hello world.md", "Foo.md", "foo.md.md"])(
    "rejects the invalid article filename %s with a clear error",
    (filename) => {
      expect(() => parseArticle(filename, source("published"))).toThrow(filename);
    },
  );

  it("returns only published articles as visible", () => {
    const review = parseArticle("review.md", source("review"));
    const published = parseArticle("published.md", source("published"));

    expect(visibleArticles([review, published])).toEqual([published]);
  });

  it("sorts by updatedAt descending and then slug ascending", () => {
    const root = mkdtempSync(join(tmpdir(), "article-repository-"));
    writeFileSync(join(root, "z-later.md"), source("published", "2026-08-19"));
    writeFileSync(join(root, "b-same.md"), source("published"));
    writeFileSync(join(root, "a-same.md"), source("published"));
    writeFileSync(join(root, "ignored.txt"), "not an article");

    expect(allArticles(root).map(({ slug }) => slug)).toEqual([
      "z-later",
      "a-same",
      "b-same",
    ]);
  });

  it("does not expose a non-published article by slug", () => {
    const draft = parseArticle("private-draft.md", source("draft"));
    const published = parseArticle("public-note.md", source("published"));

    expect(articleBySlug("private-draft", [draft, published])).toBeUndefined();
    expect(articleBySlug("public-note", [draft, published])).toEqual(published);
  });
});
