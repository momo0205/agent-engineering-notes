import { describe, expect, it } from "vitest";
import { allArticles, articleBySlug, visibleArticles } from "../../lib/content/article-repository";
import sitemap from "../../app/sitemap";
import { GET as rss } from "../../app/rss.xml/route";

const publishedSlugs = [
  "agent-llm-context-harness",
  "bounded-agent-loop",
  "java-to-agent",
  "stance-misclassification",
  "java-vs-python-worker",
] as const;

describe("first-release review boundary", () => {
  it("publishes all five owner-approved articles", () => {
    const articles = allArticles();

    expect(articles.map(({ slug }) => slug)).toEqual([...publishedSlugs].sort());
    expect(articles).toHaveLength(5);
    expect(visibleArticles(articles).map(({ slug }) => slug)).toEqual(
      [...publishedSlugs].sort(),
    );
    for (const slug of publishedSlugs) {
      expect(articleBySlug(slug, articles)?.status).toBe("published");
    }
  });

  it("includes all five approved articles in RSS and sitemap", async () => {
    const xml = await rss().text();
    const sitemapText = JSON.stringify(sitemap());

    for (const slug of publishedSlugs) {
      expect(xml).toContain(slug);
      expect(sitemapText).toContain(slug);
    }
  });
});
