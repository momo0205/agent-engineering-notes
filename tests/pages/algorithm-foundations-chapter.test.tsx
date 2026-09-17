import { cleanup, render, screen, within } from "@testing-library/react";
import {
  algorithmFoundationsChapters,
  algorithmFoundationsRevision,
} from "../../lib/content/algorithm-foundations-topic";

import AlgorithmFoundationsChapterPage, {
  generateMetadata,
  generateStaticParams,
} from "../../app/topics/algorithm-foundations/[chapter]/page";

const statusLabels = {
  learning: "学习中",
  framework: "框架已发布",
  verified: "首轮验证完成",
} as const;

async function renderRoute(chapter: string) {
  cleanup();
  render(await AlgorithmFoundationsChapterPage({ params: Promise.resolve({ chapter }) }));
}

describe("algorithm foundations chapter routes", () => {
  it("publishes the reading method and all three paper routes", () => {
    expect(generateStaticParams()).toEqual([
      { chapter: "reading-method" },
      { chapter: "resnet" },
      { chapter: "transformer" },
      { chapter: "ddpm" },
    ]);
  });

  it.each(algorithmFoundationsChapters)(
    "renders $slug with ordinary official links, real status, a fixed revision, and sanitized Markdown",
    async (chapter) => {
      await renderRoute(chapter.slug);

      expect(screen.getByRole("heading", { name: chapter.paperTitle })).toBeInTheDocument();
      expect(screen.getByText(`状态：${statusLabels[chapter.status]}`)).toBeInTheDocument();
      const officialPaper = within(screen.getByRole("region", { name: "官方原文" }));
      expect(officialPaper.getByRole("link", { name: "官方 abstract" })).toHaveAttribute("href", chapter.abstractUrl);
      expect(officialPaper.getByRole("link", { name: "官方 PDF" })).toHaveAttribute("href", chapter.pdfUrl);
      expect(officialPaper.getByRole("link", { name: "查看固定版本源码" })).toHaveAttribute(
        "href",
        `https://github.com/momo0205/paper-deep-dive/tree/${algorithmFoundationsRevision}`,
      );
      expect(screen.getByText(algorithmFoundationsRevision.slice(0, 8))).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "核心问题" })).toBeInTheDocument();
      const checklist = screen.getByRole("region", { name: `${chapter.slug === "resnet" ? "ResNet" : chapter.slug === "transformer" ? "Transformer" : "DDPM"} 学习检查` });
      expect(within(checklist).getAllByRole("checkbox").map((checkbox) => checkbox.getAttribute("data-step-id"))).toEqual([
        "question", "skim", "derive", "reproduce", "experiment", "self-check",
      ]);
      expect(screen.getByRole("link", { name: "算法原理与复现" })).toHaveAttribute(
        "href",
        "/topics/algorithm-foundations",
      );
    },
  );

  it("links the three papers in reading order without treating the method page as a paper", async () => {
    await renderRoute("resnet");
    expect(screen.queryByRole("link", { name: /上一篇/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "下一篇：Transformer" })).toHaveAttribute(
      "href",
      "/topics/algorithm-foundations/transformer",
    );

    await renderRoute("transformer");
    expect(screen.getByRole("link", { name: "上一篇：ResNet" })).toHaveAttribute(
      "href",
      "/topics/algorithm-foundations/resnet",
    );
    expect(screen.getByRole("link", { name: "下一篇：DDPM" })).toHaveAttribute(
      "href",
      "/topics/algorithm-foundations/ddpm",
    );

    await renderRoute("ddpm");
    expect(screen.getByRole("link", { name: "上一篇：Transformer" })).toHaveAttribute(
      "href",
      "/topics/algorithm-foundations/transformer",
    );
    expect(screen.queryByRole("link", { name: /下一篇/ })).not.toBeInTheDocument();
  });

  it("renders the reading method from the same route registry", async () => {
    await renderRoute("reading-method");

    expect(screen.getByRole("heading", { name: "学习方法" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "先把学习变成可检查的循环" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /开始 ResNet/ })).toHaveAttribute(
      "href",
      "/topics/algorithm-foundations/resnet",
    );
  });

  it("returns the existing not-found behavior for an unknown route", async () => {
    await expect(
      AlgorithmFoundationsChapterPage({ params: Promise.resolve({ chapter: "unknown-paper" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("sets chapter-specific metadata and leaves unknown routes without metadata", async () => {
    await expect(generateMetadata({ params: Promise.resolve({ chapter: "resnet" }) })).resolves.toMatchObject({
      title: "Deep Residual Learning for Image Recognition",
      alternates: { canonical: "/topics/algorithm-foundations/resnet" },
    });
    await expect(generateMetadata({ params: Promise.resolve({ chapter: "unknown-paper" }) })).resolves.toEqual({});
  });
});
