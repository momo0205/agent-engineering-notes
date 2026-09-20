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
    ]);
  });

  it.each(jevChapters)("renders evidence metadata for $slug", async (chapter) => {
    await renderRoute(chapter.slug);
    expect(screen.getByRole("heading", { name: chapter.title })).toBeInTheDocument();
    expect(screen.getByText("证据级别")).toBeInTheDocument();
    expect(screen.getByText("最近审阅")).toBeInTheDocument();
    expect(screen.getByText("模型版本")).toBeInTheDocument();
    expect(screen.getAllByText("实验尚未开始").length).toBeGreaterThan(0);
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
    expect(screen.queryByRole("link", { name: /下一篇/ })).not.toBeInTheDocument();
  });

  it("sets canonical metadata and rejects unknown routes", async () => {
    await expect(generateMetadata({ params: Promise.resolve({ chapter: "quickstart" }) })).resolves.toMatchObject({
      title: "从零开始调用 Jev",
      alternates: { canonical: "/topics/jev/quickstart" },
    });
    await expect(generateMetadata({ params: Promise.resolve({ chapter: "unknown" }) })).resolves.toEqual({});
    await expect(JevChapterPage({ params: Promise.resolve({ chapter: "unknown" }) })).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledOnce();
  });
});
