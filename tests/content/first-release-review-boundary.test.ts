import { describe, expect, it } from "vitest";
import { allArticles, articleBySlug, visibleArticles } from "../../lib/content/article-repository";
import sitemap from "../../app/sitemap";
import { GET as rss } from "../../app/rss.xml/route";

const publishedSlugs = [
  "agent-checkpoint-recovery",
  "agent-trace-observability",
  "agent-llm-context-harness",
  "bounded-agent-loop",
  "java-to-agent",
  "stance-misclassification",
  "java-vs-python-worker",
] as const;
const publishedInDisplayOrder = [
  "agent-trace-observability",
  "agent-checkpoint-recovery",
  "agent-llm-context-harness",
  "bounded-agent-loop",
  "java-to-agent",
  "java-vs-python-worker",
  "stance-misclassification",
] as const;

describe("first-release review boundary", () => {
  it("publishes all seven owner-approved articles", () => {
    const articles = allArticles();

    expect(articles.map(({ slug }) => slug)).toEqual([...publishedInDisplayOrder]);
    expect(articles).toHaveLength(7);
    expect(visibleArticles(articles).map(({ slug }) => slug)).toEqual(
      [...publishedInDisplayOrder],
    );
    for (const slug of publishedSlugs) {
      expect(articleBySlug(slug, articles)?.status).toBe("published");
    }
  });

  it("includes all seven approved articles in RSS and sitemap", async () => {
    const xml = await rss().text();
    const sitemapText = JSON.stringify(sitemap());

    for (const slug of publishedSlugs) {
      expect(xml).toContain(slug);
      expect(sitemapText).toContain(slug);
    }
  });
});
