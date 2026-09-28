import { cleanup, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { jevChapters } from "../../lib/content/jev-topic";

const notFoundMock = vi.hoisted(() => vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }));

vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import JevChapterPage, {
  generateMetadata,
  generateStaticParams,
} from "../../app/topics/jev/[chapter]/page";

async function renderRoute(chapter: string) {
  cleanup();
  render(await JevChapterPage({ params: Promise.resolve({ chapter }) }));
}

describe("Jev chapter routes", () => {
  beforeEach(() => {
    notFoundMock.mockClear();
  });

  it("publishes the approved chapter routes in order", () => {
    expect(generateStaticParams()).toEqual([
      { chapter: "why-jev" },
      { chapter: "capability-boundary" },
      { chapter: "text-context-reasoning" },
      { chapter: "benchmark-audit" },
      { chapter: "quickstart" },
      { chapter: "experiment-plan" },
      { chapter: "laya-reference-implementation" },
    ]);
  });

  it.each(jevChapters)("renders evidence metadata for $slug", async (chapter) => {
    await renderRoute(chapter.slug);
    expect(screen.getByRole("heading", { name: chapter.title })).toBeInTheDocument();
    expect(screen.getByText("证据级别")).toBeInTheDocument();
    expect(screen.getByText("最近审阅")).toBeInTheDocument();
    expect(screen.getByText("模型版本")).toBeInTheDocument();
    expect(screen.getAllByText(/本章尚无对应模型的本地实测/).length).toBeGreaterThan(0);
  });

  it("renders the Laya explanation as formatted article content", async () => {
    await renderRoute("laya-reference-implementation");
    expect(screen.getAllByRole("table")).toHaveLength(2);
    expect(screen.getByRole("link", { name: /Laya 源码：laya\/common\.py/ })).toHaveAttribute(
      "href", "https://github.com/NandhaKishorM/laya/blob/9d955671415fc19f069b9cc998928075c1f255ec/laya/common.py",
    );
    expect(document.querySelector(".article-body")?.textContent).toContain("双向 Transformer 编码器");
    expect(document.querySelector(".article-body pre code")).not.toBeNull();
  });

  it("derives previous and next links from registry order", async () => {
    await renderRoute("why-jev");
    expect(screen.queryByRole("link", { name: /上一篇/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: `下一篇：${jevChapters[1].title}` })).toHaveAttribute(
      "href", "/topics/jev/capability-boundary",
    );

    await renderRoute("text-context-reasoning");
    expect(screen.getByRole("link", { name: `上一篇：${jevChapters[1].title}` })).toHaveAttribute(
      "href", "/topics/jev/capability-boundary",
    );
    expect(screen.getByRole("link", { name: `下一篇：${jevChapters[3].title}` })).toHaveAttribute(
      "href", "/topics/jev/benchmark-audit",
    );

    await renderRoute("experiment-plan");
    expect(screen.getByRole("link", { name: `上一篇：${jevChapters[4].title}` })).toHaveAttribute(
      "href", "/topics/jev/quickstart",
    );
    expect(screen.getByRole("link", { name: `下一篇：${jevChapters[6].title}` })).toHaveAttribute(
      "href", "/topics/jev/laya-reference-implementation",
    );

    await renderRoute("laya-reference-implementation");
    expect(screen.getByRole("link", { name: `上一篇：${jevChapters[5].title}` })).toHaveAttribute(
      "href", "/topics/jev/experiment-plan",
    );
    expect(screen.queryByRole("link", { name: /下一篇/ })).not.toBeInTheDocument();
  });

  it("sets canonical metadata and rejects unknown routes", async () => {
    await expect(generateMetadata({ params: Promise.resolve({ chapter: "quickstart" }) })).resolves.toMatchObject({
      title: "从零开始调用 Jev",
      alternates: { canonical: "/topics/jev/quickstart" },
    });
    await expect(generateMetadata({ params: Promise.resolve({ chapter: "laya-reference-implementation" }) })).resolves.toMatchObject({
      title: "Laya：一个可检查的决策模型实现",
      alternates: { canonical: "/topics/jev/laya-reference-implementation" },
    });
    await expect(generateMetadata({ params: Promise.resolve({ chapter: "unknown" }) })).resolves.toEqual({});
    await expect(JevChapterPage({ params: Promise.resolve({ chapter: "unknown" }) })).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledOnce();
  });
});
