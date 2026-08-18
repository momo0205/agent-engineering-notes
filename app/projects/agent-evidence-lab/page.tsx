import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Evidence Lab",
  description: "用可重复实验理解一个受约束 Agent 的组成、行为和失败边界。",
  alternates: { canonical: "/projects/agent-evidence-lab" },
};

const remaining = ["Checkpoint", "Trace", "预算控制", "工具恢复"] as const;

export default function ProjectPage() {
  return (
    <main id="main-content">
      <header className="page-intro project-intro">
        <p className="eyebrow">Current project</p>
        <h1>Agent Evidence Lab</h1>
        <p>用可重复实验理解一个受约束 Agent 的组成、行为和失败边界。</p>
      </header>

      <section className="project-status" aria-labelledby="project-status-title">
        <div>
          <p className="section-kicker">进度</p>
          <h2 id="project-status-title">已完成 M0–M2</h2>
          <p>当前：M3。前几个里程碑建立了基础调用、工具约束和可复现的循环实验。</p>
        </div>
        <div className="evidence-block">
          <strong>固定测试集 5/5</strong>
          <p>这个结果只描述当前固定样本与当前实现，不能外推为生产可靠性。</p>
        </div>
      </section>

      <section className="page-section remaining-work" aria-labelledby="remaining-title">
        <p className="section-kicker">下一步</p>
        <h2 id="remaining-title">仍待完成</h2>
        <ul>
          {remaining.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p>这些能力补齐之前，项目仍是学习实验，不是生产就绪系统。</p>
      </section>
    </main>
  );
}
