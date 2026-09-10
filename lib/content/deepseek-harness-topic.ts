import capabilityBoundary from "../../content/topics/deepseek-harness/capability-boundary.md?raw";
import sourceWalkthrough from "../../content/topics/deepseek-harness/source-walkthrough.md?raw";
import pluginContextSecurity from "../../content/topics/deepseek-harness/plugin-context-security.md?raw";
import integrationDecision from "../../content/topics/deepseek-harness/integration-decision.md?raw";
import harnessFit from "../../content/topics/deepseek-harness/harness-fit.md?raw";
import toolToAgent from "../../content/topics/deepseek-harness/tool-to-agent.md?raw";
import reversiblePoc from "../../content/topics/deepseek-harness/reversible-poc.md?raw";

export type TopicChapter = {
  slug: string;
  order: string;
  title: string;
  summary: string;
  readingMinutes: number;
  body: string;
};

export const deepSeekHarnessRevision = "aa8262ec091698bae9a6b04773a6b5b06ad4aef2";
export const deepSeekHarnessReviewedAt = "2026-09-10";

export const deepSeekHarnessChapters: readonly TopicChapter[] = [
  {
    slug: "capability-boundary",
    order: "01",
    title: "先划边界：它能做什么，不能保证什么",
    summary: "把产品能力、插件提供的能力、模型能力和系统保证拆开，避免把 Harness 误解成万能 Agent。",
    readingMinutes: 12,
    body: capabilityBoundary,
  },
  {
    slug: "source-walkthrough",
    order: "02",
    title: "沿源码走一遍 Agent Loop",
    summary: "从输入队列、turn/step、模型请求、工具调用到 Session 日志，理解默认循环如何真正运转。",
    readingMinutes: 16,
    body: sourceWalkthrough,
  },
  {
    slug: "plugin-context-security",
    order: "03",
    title: "插件、上下文与安全边界",
    summary: "分析 Cordis 组合、作用域、上下文压缩、审批、沙箱与凭据，并指出这些机制的失效条件。",
    readingMinutes: 15,
    body: pluginContextSecurity,
  },
  {
    slug: "integration-decision",
    order: "04",
    title: "要不要与现有系统结合",
    summary: "对照 Agent Evidence Lab，给出不替换、先观察、以后按插件实验的工程决策。",
    readingMinutes: 11,
    body: integrationDecision,
  },
  {
    slug: "harness-fit",
    order: "05",
    title: "一个系统什么时候需要 Harness",
    summary: "以两个真实项目为对照，建立一套不依赖具体框架的 Harness 适配判断方法。",
    readingMinutes: 16,
    body: harnessFit,
  },
  {
    slug: "tool-to-agent",
    order: "06",
    title: "从工具到研究 Agent：不要跳过中间层",
    summary: "把确定性工具、AI 增强应用、工具型 Agent 和长任务 Agent 分层，说明每一步新增什么成本。",
    readingMinutes: 15,
    body: toolToAgent,
  },
  {
    slug: "reversible-poc",
    order: "07",
    title: "设计一个可撤回的 DSH 实验",
    summary: "让 DSH 编排研究过程，但不侵入量化核心；用明确指标决定实验是否值得保留。",
    readingMinutes: 14,
    body: reversiblePoc,
  },
] as const;

export function deepSeekHarnessChapter(slug: string): TopicChapter | undefined {
  return deepSeekHarnessChapters.find((chapter) => chapter.slug === slug);
}
