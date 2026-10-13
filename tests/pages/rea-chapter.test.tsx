import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ReaChapterPage, { generateMetadata } from "../../app/topics/rea/[chapter]/page";

describe("REA chapter routes", () => {
  it.each([
    "what-is-rea", "source-architecture", "evidence-and-validation",
    "engineering-use-cases", "hands-on", "integration-and-boundaries",
  ])("renders formatted content and review status for %s", async (chapter) => {
    cleanup();
    render(await ReaChapterPage({ params: Promise.resolve({ chapter }) }));
    expect(document.querySelector(".article-body h2")).not.toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("尚未本机实跑");
    expect(screen.getByRole("link", { name: "返回 REA 专题目录 →" })).toHaveAttribute("href", "/topics/rea");
  });

  it("provides ordered navigation and rejects an unknown chapter", async () => {
    render(await ReaChapterPage({ params: Promise.resolve({ chapter: "source-architecture" }) }));
    expect(screen.getByRole("link", { name: /上一篇/ })).toHaveAttribute("href", "/topics/rea/what-is-rea");
    expect(screen.getByRole("link", { name: /下一篇/ })).toHaveAttribute("href", "/topics/rea/evidence-and-validation");
    await expect(generateMetadata({ params: Promise.resolve({ chapter: "hands-on" }) })).resolves.toMatchObject({
      alternates: { canonical: "/topics/rea/hands-on" },
    });
    await expect(ReaChapterPage({ params: Promise.resolve({ chapter: "unknown" }) })).rejects.toThrow();
  });
});
