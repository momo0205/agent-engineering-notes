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
  { slug: "what-is-rea", order: "01", title: "REA 到底解决什么问题", summary: "直说 AI 辅助逆向的定位，展开功能地图，比较人、普通 Agent 与 REA 工具链的分工。", readingMinutes: 18, body: whatIsRea },
  { slug: "source-architecture", order: "02", title: "沿源码走一次分析请求", summary: "从实际 JS 输出回到契约、图与上下文，再学习原生函数的汇编、伪代码和引用调查路径。", readingMinutes: 21, body: sourceArchitecture },
  { slug: "evidence-and-validation", order: "03", title: "证据、推断与未知", summary: "结合真实 unknown 比较，区分观察、解释、因果与覆盖，说明为什么零个 changed 不等于没变化。", readingMinutes: 16, body: evidenceAndValidation },
  { slug: "engineering-use-cases", order: "04", title: "工程师可以怎样用", summary: "按发布产物、Electron、SDK、CLI 与网络场景，明确调查步骤、交付物、验收和停止条件。", readingMinutes: 13, body: engineeringUseCases },
  { slug: "hands-on", order: "05", title: "从自有产物开始实践", summary: "真实记录 Mac 失败、Linux 分析、返回形状 unknown 与三版行为验收，再给出可复现命令和后续练习。", readingMinutes: 32, body: handsOn },
  { slug: "integration-and-boundaries", order: "06", title: "能力边界与接入判断", summary: "把版本、平台、权限、数据流与预算落到任务，判断什么时候接入、什么时候保留现有工具。", readingMinutes: 12, body: integrationAndBoundaries },
];

export function reaChapter(slug: string): ReaChapter | undefined {
  return reaChapters.find((chapter) => chapter.slug === slug);
}
