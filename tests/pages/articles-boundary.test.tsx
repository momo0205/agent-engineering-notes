import { render } from "@testing-library/react";
import { vi } from "vitest";
import type { SearchArticleMetadata } from "../../lib/content/article-search-items";

const boundary = vi.hoisted(() => ({
  received: undefined as readonly SearchArticleMetadata[] | undefined,
}));

const repositoryArticles = vi.hoisted(() => [
  {
    slug: "published-loop",
    title: "Published Agent Loop",
    summary: "A public experiment summary.",
    status: "published" as const,
    category: "工程实践" as const,
    publishedAt: "2026-08-16",
    updatedAt: "2026-08-18",
    readingMinutes: 7,
    tags: ["Agent", "Loop"],
    body: "Full body that must remain on the server.",
  },
  {
    slug: "draft-trace",
    title: "Draft trace notes",
    summary: "Unpublished draft material.",
    status: "draft" as const,
    category: "真实复盘" as const,
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
    status: "review" as const,
    category: "架构决策" as const,
    publishedAt: "2026-08-17",
    updatedAt: "2026-08-18",
    readingMinutes: 5,
    tags: ["Budget"],
    body: "Review body.",
  },
]);

vi.mock("../../lib/content/article-repository", () => ({
  visibleArticles: () => repositoryArticles,
}));

vi.mock("../../components/search-filter", () => ({
  SearchFilter: ({ articles }: { articles: readonly SearchArticleMetadata[] }) => {
    boundary.received = articles;
    return <div data-testid="search-filter" />;
  },
}));

import ArticlesPage from "../../app/articles/page";

describe("articles server-to-client boundary", () => {
  it("passes SearchFilter only published, display-ready metadata", () => {
    render(<ArticlesPage />);

    expect(boundary.received).toHaveLength(1);
    expect(boundary.received?.[0].slug).toBe("published-loop");
    expect(Object.keys(boundary.received?.[0] ?? {}).sort()).toEqual(
      ["slug", "title", "summary", "tags", "category", "readingMinutes"].sort(),
    );
    for (const privateKey of ["body", "status", "publishedAt", "updatedAt"]) {
      expect(boundary.received?.[0]).not.toHaveProperty(privateKey);
    }
  });
});
