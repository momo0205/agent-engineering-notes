import type { Article } from "../../lib/content/article-schema";
import { toSearchItems } from "../../lib/content/article-search-items";

describe("toSearchItems", () => {
  const articles: Article[] = [
    {
      slug: "published-loop",
      title: "Published Agent Loop",
      summary: "A public experiment summary.",
      status: "published",
      category: "工程实践",
      publishedAt: "2026-08-16",
      updatedAt: "2026-08-18",
      readingMinutes: 7,
      tags: ["Agent", "Loop"],
      body: "Full article body that must not cross the client boundary.",
    },
    {
      slug: "draft-trace",
      title: "Draft trace notes",
      summary: "Unpublished draft material.",
      status: "draft",
      category: "真实复盘",
      publishedAt: "2026-08-17",
      updatedAt: "2026-08-18",
      readingMinutes: 4,
      tags: ["Trace"],
      body: "Draft body.",
    },
    {
      slug: "review-budget",
      title: "Review budget notes",
      summary: "Material still under review.",
      status: "review",
      category: "架构决策",
      publishedAt: "2026-08-17",
      updatedAt: "2026-08-18",
      readingMinutes: 5,
      tags: ["Budget"],
      body: "Review body.",
    },
  ];

  it("allows only published metadata through the server-to-client boundary", () => {
    const items = toSearchItems(articles);

    expect(items).toHaveLength(1);
    expect(items[0].slug).toBe("published-loop");
    expect(Object.keys(items[0]).sort()).toEqual(
      ["slug", "title", "summary", "tags", "category", "readingMinutes"].sort(),
    );
    expect(items[0]).not.toHaveProperty("body");
    expect(items[0]).not.toHaveProperty("status");
    expect(items[0]).not.toHaveProperty("publishedAt");
    expect(items[0]).not.toHaveProperty("updatedAt");
  });
});
