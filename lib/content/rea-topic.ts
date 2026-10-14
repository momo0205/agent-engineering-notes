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
  { slug: "what-is-rea", order: "01", title: "REA 到底解决什么问题", summary: "从软件调查中的缺失事实出发，建立 REA、AI 与验证的整体认识，再进入源码和实践。", readingMinutes: 12, body: whatIsRea },
  { slug: "source-architecture", order: "02", title: "沿源码走一次分析请求", summary: "先理解请求怎样成为证据，再沿真实文件、代码与状态边界逐层深入。", readingMinutes: 24, body: sourceArchitecture },
  { slug: "evidence-and-validation", order: "03", title: "证据、推断与未知", summary: "从材料与结论的区别，深入 confidence、哈希、真实形状配对与独立验收。", readingMinutes: 19, body: evidenceAndValidation },
  { slug: "engineering-use-cases", order: "04", title: "工程师可以怎样用", summary: "先按场景判断工程价值，再查阅工具家族、专用载体和采用前提。", readingMinutes: 20, body: engineeringUseCases },
  { slug: "hands-on", order: "05", title: "从自有产物开始实践", summary: "从纯 Node 行为对照开始，复查真实 REA 记录，再用任务书和报告模板组织实践。", readingMinutes: 37, body: handsOn },
  { slug: "integration-and-boundaries", order: "06", title: "能力边界与接入判断", summary: "分别确认版本、三条数据流与操作权限，用明确的接入契约决定是否采用。", readingMinutes: 14, body: integrationAndBoundaries },
];

export function reaChapter(slug: string): ReaChapter | undefined {
  return reaChapters.find((chapter) => chapter.slug === slug);
}
