import { describe, expect, it } from "vitest";
import {
  jevChapter,
  jevChapters,
  jevModelVersion,
  jevReviewedAt,
} from "../../lib/content/jev-topic";

const expectedSlugs = [
  "why-jev",
  "capability-boundary",
  "text-context-reasoning",
  "benchmark-audit",
  "quickstart",
  "experiment-plan",
];

describe("Jev research topic registry", () => {
  it("publishes the approved six chapters in order", () => {
    expect(jevChapters.map(({ slug }) => slug)).toEqual(expectedSlugs);
    expect(jevReviewedAt).toBe("2026-09-20");
    expect(jevModelVersion).toMatch(/jev/i);
    expect(jevChapter("why-jev")?.order).toBe("01");
    expect(jevChapter("missing")).toBeUndefined();
  });

  it("requires evidence and experiment metadata on every chapter", () => {
    for (const chapter of jevChapters) {
      expect(chapter.evidenceLevels.length).toBeGreaterThan(0);
      expect(chapter.reviewedAt).toMatch(/^2026-\d{2}-\d{2}$/);
      expect(["research", "verified", "experiment-pending"]).toContain(chapter.status);
      expect(chapter.body.length).toBeGreaterThan(800);
    }
  });

  it("keeps performance claims attached to their audit boundary", () => {
    const body = jevChapter("benchmark-audit")!.body;
    expect(body).toContain("原始声明");
    expect(body).toContain("计算口径");
    expect(body).toContain("当前判断");
    expect(body).toContain("不同的对照");
    expect(body).toContain("不是人工真值");
  });

  it("marks the experiment as planned rather than completed", () => {
    const body = jevChapter("experiment-plan")!.body;
    expect(body).toContain("实验尚未开始");
    expect(body).toContain("Shadow Mode");
    expect(body).not.toMatch(/我们已经证明|实验结果表明/);
  });

  it("documents safe key configuration without publishing a key", () => {
    const body = jevChapter("quickstart")!.body;
    expect(body).toContain("TYPESAFE_API_KEY");
    expect(body).toContain("环境变量");
    expect(body).not.toMatch(/(?:sk|ts)-[A-Za-z0-9_-]{20,}/);
  });
});
