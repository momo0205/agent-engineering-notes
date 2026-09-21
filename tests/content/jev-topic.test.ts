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

  it("keeps public claims attached to primary sources and publication boundaries", () => {
    const payload = jevChapters.map(({ body }) => body).join("\n");
    expect(payload).toContain("https://typesafe.ai/");
    expect(payload).toContain("https://docs.typesafe.ai/");
    expect(payload).toContain("https://github.com/typesafe-ai/typesafe-sdk-python");
    expect(payload).toContain("https://evals.typesafe.ai/");
    expect(payload).not.toContain("paperDeepDive.v1");
    expect(payload).not.toMatch(/(?:sk|ts)-[A-Za-z0-9_-]{20,}/);
    expect(payload).not.toMatch(/零幻觉|绝对可靠/);
  });

  it("does not confuse reasoning mode with whether reasoning text is visible", () => {
    const body = jevChapter("text-context-reasoning")!.body;
    expect(body).toContain("thinking-enabled");
    expect(body).toContain("thinking-disabled");
    expect(body).toContain("不能单独证明可见文本");
    expect(body).toContain("推理 token");
  });

  it("keeps threshold tuning separate from held-out evaluation", () => {
    const body = jevChapter("experiment-plan")!.body;
    expect(body).toContain("开发/校准集");
    expect(body).toContain("保留测试集");
    expect(body).toContain("配置冻结");
    expect(body).toContain("相关样本");
  });
});
