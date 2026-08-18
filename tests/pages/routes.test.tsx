import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, vi } from "vitest";
import { SiteHeader } from "../../components/site-header";
import type { Article } from "../../lib/content/article-schema";

const visibleArticlesMock = vi.hoisted(() => vi.fn());

vi.mock("../../lib/content/article-repository", () => ({
  visibleArticles: visibleArticlesMock,
}));

import Home from "../../app/page";

describe("home page", () => {
  beforeEach(() => {
    visibleArticlesMock.mockReturnValue([]);
  });

  it("introduces the learning story, current project and recent writing", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /真正能工作的 Agent/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Agent Evidence Lab")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "最近写下的东西" }),
    ).toBeInTheDocument();
  });

  it("links a real published article and fills remaining slots with honest teasers", () => {
    const article: Article = {
      slug: "real-agent-loop",
      title: "真实发布的 Agent Loop 复盘",
      summary: "这是用于首页契约测试的公开文章摘要。",
      status: "published",
      category: "工程实践",
      publishedAt: "2026-08-18",
      updatedAt: "2026-08-18",
      readingMinutes: 8,
      tags: ["Agent"],
      body: "正文",
    };
    visibleArticlesMock.mockReturnValue([article]);

    render(<Home />);

    expect(
      screen.getByRole("link", { name: article.title }),
    ).toHaveAttribute("href", "/articles/real-agent-loop");
    expect(screen.getAllByText(/即将整理/)).toHaveLength(2);
  });
});

describe("skip navigation", () => {
  it("links to the shared main-content target", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "跳到正文" })).toHaveAttribute(
      "href",
      "#main-content",
    );
  });

  it.each([
    "app/page.tsx",
    "app/articles/page.tsx",
    "app/articles/[slug]/page.tsx",
  ])("provides the shared target on %s", (routeFile) => {
    const source = readFileSync(join(process.cwd(), routeFile), "utf8");

    expect(source).toContain('<main id="main-content">');
  });
});
