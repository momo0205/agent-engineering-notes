import whatIsRea from "../../content/topics/rea/what-is-rea.md?raw";
import sourceArchitecture from "../../content/topics/rea/source-architecture.md?raw";
import evidenceAndValidation from "../../content/topics/rea/evidence-and-validation.md?raw";
import engineeringUseCases from "../../content/topics/rea/engineering-use-cases.md?raw";
import handsOn from "../../content/topics/rea/hands-on.md?raw";
import integrationAndBoundaries from "../../content/topics/rea/integration-and-boundaries.md?raw";

export const reaRevision = "d13c9f840d36a321a56917e75c48afcb8d72920e";
export const reaReleaseRevision = "a56f7bb668ab23fec8d33f7af353ac7ed2fe1895";
export const reaReviewedAt = "2026-10-13";

export type ReaChapter = {
  slug: string;
  order: string;
  title: string;
  summary: string;
  readingMinutes: number;
  body: string;
};

export const reaChapters: readonly ReaChapter[] = [
  { slug: "what-is-rea", order: "01", title: "REA 到底解决什么问题", summary: "从真实软件调查出发，理解 Agent、MCP 与工具的分工，以及什么时候值得使用 REA。", readingMinutes: 7, body: whatIsRea },
  { slug: "source-architecture", order: "02", title: "沿源码走一次分析请求", summary: "追踪参数、静态解析、关系图与 Evidence，理解工具怎样取得可追溯的事实。", readingMinutes: 10, body: sourceArchitecture },
  { slug: "evidence-and-validation", order: "03", title: "证据、推断与未知", summary: "区分来源类别、概率与正确性，检查哈希、分析覆盖和有限重建验证的含义。", readingMinutes: 10, body: evidenceAndValidation },
  { slug: "engineering-use-cases", order: "04", title: "工程师可以怎样用", summary: "讨论发布产物、Electron、本地 SDK、版本回归与互操作，并说明 Java 能力边界。", readingMinutes: 9, body: engineeringUseCases },
  { slug: "hands-on", order: "05", title: "从自有产物开始实践", summary: "用固定发布版分析小型 JavaScript 产物，再让 Agent 解释、重写并接受独立测试。", readingMinutes: 12, body: handsOn },
  { slug: "integration-and-boundaries", order: "06", title: "能力边界与接入判断", summary: "核对 release 与 main、Harness 接入、平台、数据流和运行权限，规划后续实验。", readingMinutes: 9, body: integrationAndBoundaries },
];

export function reaChapter(slug: string): ReaChapter | undefined {
  return reaChapters.find((chapter) => chapter.slug === slug);
}
