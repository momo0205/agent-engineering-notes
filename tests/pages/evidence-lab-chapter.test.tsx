import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ChapterPage, { generateMetadata, generateStaticParams } from "../../app/projects/agent-evidence-lab/[chapter]/page";
import sitemap from "../../app/sitemap";

describe("Agent Evidence Lab reading routes", () => {
  it("publishes the complete finite reading path with canonical metadata", async () => {
    const slugs = ["why-research-agents", "research-pipeline", "loop-and-harness", "context-and-tools", "evidence-and-quality", "case-and-next-step"];
    expect(generateStaticParams()).toEqual(slugs.map((chapter) => ({ chapter })));
    const urls = sitemap().map((entry) => entry.url);
    for (const chapter of slugs) {
      const path = `/projects/agent-evidence-lab/${chapter}`;
      expect((await generateMetadata({ params: Promise.resolve({ chapter }) })).alternates).toEqual({ canonical: path });
      expect(urls.some((url) => url.endsWith(path))).toBe(true);
    }
  });

  it("renders a chapter's diagrams and navigates to its neighbors", async () => {
    render(await ChapterPage({ params: Promise.resolve({ chapter: "loop-and-harness" }) }));
    expect(screen.getByRole("figure")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /上一篇/ })).toHaveAttribute("href", "/projects/agent-evidence-lab/research-pipeline");
    expect(screen.getByRole("link", { name: /下一篇/ })).toHaveAttribute("href", "/projects/agent-evidence-lab/context-and-tools");
    expect(screen.getByRole("link", { name: "返回项目总览 →" })).toHaveAttribute("href", "/projects/agent-evidence-lab");
  });

  it("has no previous chapter on the first page and rejects unknown slugs", async () => {
    render(await ChapterPage({ params: Promise.resolve({ chapter: "why-research-agents" }) }));
    expect(screen.queryByRole("link", { name: /上一篇/ })).toBeNull();
    await expect(ChapterPage({ params: Promise.resolve({ chapter: "unknown" }) })).rejects.toThrow();
    await expect(generateMetadata({ params: Promise.resolve({ chapter: "unknown" }) })).resolves.toEqual({});
  });
});
