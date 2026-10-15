export type ResearchTopic = {
  href: string;
  title: string;
  summary: string;
  tags: readonly string[];
  progress: string;
};

export type ResearchTopicGroup = {
  id: string;
  title: string;
  summary: string;
  topics: readonly ResearchTopic[];
};

export const researchTopicGroups: readonly ResearchTopicGroup[] = [
  {
    id: "agent-engineering",
    title: "Agent 工程",
    summary: "理解宿主怎样推进任务，工具怎样取得事实，以及结果怎样被验证。",
    topics: [
      {
        href: "/projects/agent-evidence-lab",
        title: "Agent Evidence Lab",
        summary: "研究 Agent 的 Agent：沿问题、证据、Loop、上下文与质量验证，理解代码和模型怎样协作。",
        tags: ["Agent Evidence Lab", "Agent", "研究", "Loop", "证据", "Java", "Spring AI"],
        progress: "六章研究与实现 · 本机限定验收",
      },
      {
        href: "/topics/deepseek-harness",
        title: "DeepSeek Harness",
        summary: "从固定源码理解 Agent Loop、上下文、插件与接入判断。",
        tags: ["harness", "agent", "loop", "上下文", "插件"],
        progress: "源码研究 · 持续更新",
      },
      {
        href: "/topics/rea",
        title: "REA 工具与逆向工程",
        summary: "理解 AI 辅助逆向，结合源码与真实小样本，检查工具输出、模型解释和行为验证。",
        tags: ["REA", "reverse engineering", "MCP", "反编译", "二进制", "工具", "JavaScript"],
        progress: "最小 JS 实跑完成 · 原生实验待完成",
      },
    ],
  },
  {
    id: "algorithms-and-models",
    title: "算法与模型",
    summary: "把论文、模型机制、代码与实验连接起来，区分理解和实测结论。",
    topics: [
      {
        href: "/topics/algorithm-foundations",
        title: "算法原理与复现",
        summary: "围绕 ResNet、Transformer 和 DDPM，建立知识关系与持续学习记录。",
        tags: ["算法", "论文", "ResNet", "Transformer", "DDPM", "扩散", "注意力"],
        progress: "学习工作台 · 持续追加",
      },
      {
        href: "/topics/jev",
        title: "Jev 决策模型",
        summary: "研究类型化概率决策、分类器对照、Laya 实现与性能声明。",
        tags: ["Jev", "Laya", "分类器", "概率", "决策", "校准"],
        progress: "研究中 · 已有小样本探索",
      },
    ],
  },
];
