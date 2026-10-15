import why from "../../content/projects/agent-evidence-lab/why-research-agents.md?raw";
import pipeline from "../../content/projects/agent-evidence-lab/research-pipeline.md?raw";
import loop from "../../content/projects/agent-evidence-lab/loop-and-harness.md?raw";
import context from "../../content/projects/agent-evidence-lab/context-and-tools.md?raw";
import quality from "../../content/projects/agent-evidence-lab/evidence-and-quality.md?raw";
import next from "../../content/projects/agent-evidence-lab/case-and-next-step.md?raw";

export const evidenceLabReviewedAt = "2026-10-15";
export const evidenceLabRevision = "8afe9f4";
export const evidenceLabBasePath = "/projects/agent-evidence-lab";

export const evidenceLabChapters = [
  { slug: "why-research-agents", order: "01", title: "为什么做研究 Agent 的 Agent", summary: "从学习与研发中的具体困难出发，理解产品要帮助谁、解决什么问题，以及长期服务的方向。", readingMinutes: 12, body: why },
  { slug: "research-pipeline", order: "02", title: "一次研究怎样产生报告", summary: "沿问题、来源、主张、证据与研究运行，理解数据怎样连接，报告为什么能保存和重读。", readingMinutes: 16, body: pipeline },
  { slug: "loop-and-harness", order: "03", title: "模型判断怎样变成受控行动", summary: "沿真实执行路径区分代码与模型，理解停止、预算、恢复、Checkpoint 和 Trace 的作用。", readingMinutes: 19, body: loop },
  { slug: "context-and-tools", order: "04", title: "上下文与工具怎样组织", summary: "理解模型实际看到了哪些材料，检索、引用解析与完整原文复核怎样各守边界。", readingMinutes: 16, body: context },
  { slug: "evidence-and-quality", order: "05", title: "怎样判断报告可信", summary: "区分来源、引用校验、语义判断、独立验证与运行状态，用失败案例理解验收的边界。", readingMinutes: 18, body: quality },
  { slug: "case-and-next-step", order: "06", title: "从当前切片走向深度研究", summary: "复盘完整原文样本，解释标题级证据的局限，再定义问题驱动的主动补证据任务与验收目标。", readingMinutes: 16, body: next },
] as const;

export function evidenceLabChapter(slug: string) {
  return evidenceLabChapters.find((chapter) => chapter.slug === slug);
}
