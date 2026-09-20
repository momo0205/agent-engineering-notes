import whyJev from "../../content/topics/jev/why-jev.md?raw";
import capabilityBoundary from "../../content/topics/jev/capability-boundary.md?raw";
import textContextReasoning from "../../content/topics/jev/text-context-reasoning.md?raw";
import benchmarkAudit from "../../content/topics/jev/benchmark-audit.md?raw";
import quickstart from "../../content/topics/jev/quickstart.md?raw";
import experimentPlan from "../../content/topics/jev/experiment-plan.md?raw";

export type EvidenceLevel =
  | "official-fact"
  | "vendor-claim"
  | "third-party"
  | "local-reproduction"
  | "provisional"
  | "unresolved"
  | "overturned";

export type JevChapterStatus = "research" | "verified" | "experiment-pending";

export type JevTopicChapter = {
  slug: string;
  order: string;
  title: string;
  summary: string;
  readingMinutes: number;
  status: JevChapterStatus;
  evidenceLevels: readonly EvidenceLevel[];
  reviewedAt: string;
  modelVersion: string;
  localExperiment: "not-started" | "completed";
  body: string;
};

export const jevReviewedAt = "2026-09-20";
export const jevModelVersion = "jev-1.13.0 / early access";

export const jevChapters: readonly JevTopicChapter[] = [
  {
    slug: "why-jev",
    order: "01",
    title: "为什么研究一个不写文本的模型",
    summary: "从运行时只需要一个决定的场景出发，明确这个专题要验证的问题、证据标准和阅读路线。",
    readingMinutes: 9,
    status: "research",
    evidenceLevels: ["official-fact", "vendor-claim", "provisional", "unresolved"],
    reviewedAt: jevReviewedAt,
    modelVersion: jevModelVersion,
    localExperiment: "not-started",
    body: whyJev,
  },
  {
    slug: "capability-boundary",
    order: "02",
    title: "Jev 是什么，不是什么",
    summary: "用接口契约和相邻技术对比，划清类型正确、语义正确与可安全自动执行之间的边界。",
    readingMinutes: 13,
    status: "research",
    evidenceLevels: ["official-fact", "vendor-claim", "provisional"],
    reviewedAt: jevReviewedAt,
    modelVersion: jevModelVersion,
    localExperiment: "not-started",
    body: capabilityBoundary,
  },
  {
    slug: "text-context-reasoning",
    order: "03",
    title: "没有文本，它还在“思考”吗",
    summary: "把输入上下文、内部计算、可见思维链和最终文本拆开，避免把接口现象误写成模型机制。",
    readingMinutes: 12,
    status: "research",
    evidenceLevels: ["official-fact", "vendor-claim", "provisional", "unresolved"],
    reviewedAt: jevReviewedAt,
    modelVersion: jevModelVersion,
    localExperiment: "not-started",
    body: textContextReasoning,
  },
  {
    slug: "benchmark-audit",
    order: "04",
    title: "审计 193.6×、444.6× 与 67.8%",
    summary: "还原厂商数字的原始声明、比较对象和计算口径，并明确这些评测不能证明什么。",
    readingMinutes: 14,
    status: "research",
    evidenceLevels: ["official-fact", "vendor-claim", "provisional", "unresolved"],
    reviewedAt: jevReviewedAt,
    modelVersion: jevModelVersion,
    localExperiment: "not-started",
    body: benchmarkAudit,
  },
  {
    slug: "quickstart",
    order: "05",
    title: "从零开始调用 Jev",
    summary: "从申请访问、保护密钥到 Choice、Score、Noul，建立可以安全执行的最小实践路径。",
    readingMinutes: 15,
    status: "research",
    evidenceLevels: ["official-fact", "vendor-claim", "unresolved"],
    reviewedAt: jevReviewedAt,
    modelVersion: jevModelVersion,
    localExperiment: "not-started",
    body: quickstart,
  },
  {
    slug: "experiment-plan",
    order: "06",
    title: "我们准备怎样验证它",
    summary: "定义规则、DeepSeek 与 Jev 的可复现对照实验，以及从离线评测走向 Shadow Mode 的门槛。",
    readingMinutes: 14,
    status: "experiment-pending",
    evidenceLevels: ["provisional", "unresolved"],
    reviewedAt: jevReviewedAt,
    modelVersion: jevModelVersion,
    localExperiment: "not-started",
    body: experimentPlan,
  },
] as const;

export function jevChapter(slug: string): JevTopicChapter | undefined {
  return jevChapters.find((chapter) => chapter.slug === slug);
}
