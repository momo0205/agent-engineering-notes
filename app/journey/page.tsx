import { ReadingPath, type ReadingPathStep } from "../../components/reading-path";

const steps: ReadingPathStep[] = [
  { title: "LLM API", description: "先理解请求、响应、采样参数与失败边界。", status: "已记录" },
  { title: "Tool Calling", description: "让模型以受约束的结构选择并调用工具。", status: "已记录" },
  { title: "Context", description: "管理模型每一步真正能看到的信息。", status: "已记录" },
  { title: "Harness", description: "用代码承接状态、权限、停止条件和错误。", status: "正在学习" },
  { title: "RAG", description: "在需要时检索可追溯的外部知识。", status: "待探索" },
  { title: "Loop", description: "组织观察、决策、行动与反馈的循环。", status: "正在学习" },
  { title: "Evaluation", description: "用固定样本、证据和边界判断变化。", status: "待探索" },
  { title: "Production", description: "补齐可靠性、成本、安全与可运维性。", status: "待探索" },
];

export default function JourneyPage() {
  return (
    <main id="main-content">
      <header className="page-intro journey-intro">
        <p className="eyebrow">Learning dependencies</p>
        <h1>学习路径</h1>
        <p>
          这条路径表达的是学习依赖和当前进度：后面的能力建立在前面的理解之上，
          但不代表所有阶段都已完成。
        </p>
      </header>
      <section className="page-section" aria-label="学习阶段">
        <ReadingPath steps={steps} />
      </section>
    </main>
  );
}
