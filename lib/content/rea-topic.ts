import whatIsRea from "../../content/topics/rea/what-is-rea.md?raw";
import sourceArchitecture from "../../content/topics/rea/source-architecture.md?raw";
import evidenceAndValidation from "../../content/topics/rea/evidence-and-validation.md?raw";
import engineeringUseCases from "../../content/topics/rea/engineering-use-cases.md?raw";
import handsOn from "../../content/topics/rea/hands-on.md?raw";
import integrationAndBoundaries from "../../content/topics/rea/integration-and-boundaries.md?raw";

export const reaRevision = "d13c9f840d36a321a56917e75c48afcb8d72920e";
export const reaReleaseRevision = "a56f7bb668ab23fec8d33f7af353ac7ed2fe1895";
export const reaReviewedAt = "2026-10-13";
export const reaUpdatedAt = "2026-10-14";

export type ReaChapter = {
  slug: string;
  order: string;
  title: string;
  summary: string;
  readingMinutes: number;
  body: string;
};

export const reaChapters: readonly ReaChapter[] = [
  { slug: "what-is-rea", order: "01", title: "REA 到底解决什么问题", summary: "以导出异常为调查主线，展开功能地图，区分大模型、Harness、MCP、Skill 与分析工具。", readingMinutes: 15, body: whatIsRea },
  { slug: "source-architecture", order: "02", title: "沿源码走一次分析请求", summary: "追踪契约、工作流、静态图与 Evidence，解释上下文读取、CLI/MCP 会话和 Provider 的边界。", readingMinutes: 14, body: sourceArchitecture },
  { slug: "evidence-and-validation", order: "03", title: "证据、推断与未知", summary: "用调查声明区分观察、解释与因果，核查哈希、未知修订、覆盖范围及独立验证。", readingMinutes: 12, body: evidenceAndValidation },
  { slug: "engineering-use-cases", order: "04", title: "工程师可以怎样用", summary: "按发布产物、Electron、SDK、CLI 与网络场景，明确调查步骤、交付物、验收和停止条件。", readingMinutes: 13, body: engineeringUseCases },
  { slug: "hands-on", order: "05", title: "从自有产物开始实践", summary: "从固定发布版与白盒样本开始，练习取证、AI 解释、候选实现、失败复盘和独立测试。", readingMinutes: 17, body: handsOn },
  { slug: "integration-and-boundaries", order: "06", title: "能力边界与接入判断", summary: "把版本、平台、权限、数据流与预算落到任务，判断什么时候接入、什么时候保留现有工具。", readingMinutes: 12, body: integrationAndBoundaries },
];

export function reaChapter(slug: string): ReaChapter | undefined {
  return reaChapters.find((chapter) => chapter.slug === slug);
}
