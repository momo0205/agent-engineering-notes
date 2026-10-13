import type { Metadata } from "next";
import { TopicDirectory } from "../../components/topic-directory";
import { researchTopicGroups } from "../../lib/content/research-topics";

export const metadata: Metadata = {
  title: "专题研究",
  description: "从 Agent 工程到算法与模型：源码、问题、实验和持续更新的研究记录。",
  alternates: { canonical: "/topics" },
};

export default function TopicsPage() {
  return (
    <main id="main-content" className="topic-page">
      <header className="topic-hero">
        <p className="eyebrow">Research notebook</p>
        <h1>专题研究</h1>
        <p className="topic-lead">从一个值得追问的问题开始，读源码、做实验，再留下有依据的判断。这里按研究方向组织，每个专题都可以持续补充。</p>
      </header>
      <TopicDirectory groups={researchTopicGroups} />
      <aside className="topic-note">
        <strong>怎样串起来读</strong>
        <p>算法解释模型怎样计算；Jev 研究模型怎样给出决定；Harness 组织任务循环；REA 让循环取得真实软件的观察。它们讨论不同层次，也共享同一个问题：结论怎样验证。</p>
      </aside>
    </main>
  );
}
