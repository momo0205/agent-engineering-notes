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
  "laya-reference-implementation",
];

describe("Jev research topic registry", () => {
  it("publishes the research chapters in order", () => {
    expect(jevChapters.map(({ slug }) => slug)).toEqual(expectedSlugs);
    expect(jevReviewedAt).toBe("2026-09-29");
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

  it("separates completed offline baselines from the unrun live Jev evaluation", () => {
    const body = jevChapter("experiment-plan")!.body;
    expect(body).toContain("Jev 在线实测尚未开始");
    expect(body).toContain("规则/分类器离线试跑");
    expect(body).toContain("正式对照评估还没有开始");
    expect(body).toContain("正式对照评估完成前，正式结果位均标记待执行");
    expect(body).toContain("探索性试跑单独说明");
    expect(body).toContain("探索性小样本");
    expect(body).toContain("Shadow Mode");
    expect(body).not.toMatch(/我们已经证明|实验结果表明/);
  });

  it("treats Laya as an inspectable reference, not evidence about Jev internals", () => {
    const chapter = jevChapter("laya-reference-implementation")!;
    expect(chapter.title).toBe("Laya：一个可检查的决策模型实现");
    expect(chapter.localExperiment).toBe("completed");
    expect(chapter.evidenceLevels).toContain("local-reproduction");
    expect(chapter.body).toContain("双向 Transformer 编码器");
    expect(chapter.body).toContain("`choice`");
    expect(chapter.body).toContain("0.766");
    expect(chapter.body).toContain("0.361");
    expect(chapter.body).toContain("0.352");
    expect(chapter.body).toContain("0.461");
    expect(chapter.body).toContain("不能据此推断 Jev");
    expect(chapter.body).toContain("项目自报");
    expect(chapter.body).toContain("13/18");
    expect(chapter.body).toContain("30/72");
    expect(chapter.body).toContain("0.9437");
    expect(chapter.body).toContain("太慢了");
    expect(chapter.body).toContain("20/64");
    expect(chapter.body).toContain("64/64");
    expect(chapter.body).toContain("不是留出测试集");
    expect(chapter.body).toContain("20260929T082350Z-laya-calibration");
    expect(chapter.body).toContain("20260928T085020Z-rules-calibration");
    expect(chapter.body).toContain("20260928T085005Z-tfidf-logreg-calibration");
    expect(chapter.body).toContain("14/20");
    expect(chapter.body).toContain("3/8");
    expect(chapter.body).toContain("464a2c5d4c8b58c69d9f67eea251b478ca375bb9");
    expect(chapter.body).toContain("0d93dd32608ea1a3c8b98453e28416d0bb188c6acd5fd7211628132b3cee7042");
    expect(chapter.body).toContain("16/20");
    expect(chapter.body).toContain("未复现");
    expect(chapter.body).toContain("https://github.com/NandhaKishorM/laya/blob/9d955671415fc19f069b9cc998928075c1f255ec/research/benchmarks/zh_short_commands/README.md");
    expect(chapter.body).toContain("https://github.com/NandhaKishorM/laya/blob/9d955671415fc19f069b9cc998928075c1f255ec/research/benchmarks/feishu_zh/README.md");
  });

  it("updates the research route without claiming live Jev results", () => {
    const why = jevChapter("why-jev")!.body;
    expect(why).toContain("规则/分类器离线试跑");
    expect(why).toContain("正式对照评估和 Jev 在线实测尚未开始");
    expect(why).toContain("Jev 在线实测尚未开始");
    expect(why).not.toContain("第一版还没有“本地复现”");
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
