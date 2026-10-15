export type EvidenceLabDiagramKind = "purpose" | "pipeline" | "loop" | "context" | "validation" | "deep-research";
type Step = { title: string; detail: string; tone: "blue" | "green" | "warm" };
type Diagram = { title: string; introduction: string; steps: Step[]; note: string; caption: string };

const diagrams: Record<EvidenceLabDiagramKind, Diagram> = {
  purpose: {
    title: "从工程问题走向可继续核查的研发判断",
    introduction: "先明确想解决的问题，再取得和解释材料。长期目标还包括受控实验与持续运行。",
    steps: [
      { title: "人的问题", detail: "例如：工具输出怎样进入下一轮上下文，应该在哪一层约束？", tone: "blue" },
      { title: "来源与证据", detail: "固定研究对象与材料版本，保留原文和证据缺口。", tone: "green" },
      { title: "受限研究", detail: "代码组织检索与调用，模型解释语义，校验器检查允许的输出。", tone: "blue" },
      { title: "报告与建议", detail: "说明机制、适用范围、可借鉴做法与未知，保存为可重读记录。", tone: "warm" },
    ],
    note: "当前已实现受限的研究与固定实验切片。主动追读材料、通用受控实验和服务器长期服务仍是后续能力。",
    caption: "图 01 · 产品目标与当前切片的关系示意；不表示每次研究都已执行实验。",
  },
  pipeline: {
    title: "一条研究请求，连接六类持久化材料",
    introduction: "这里画的是已合并基线中的 Signal 锚定工作流；不是自动浏览整个互联网。",
    steps: [
      { title: "选择 Signal 与问题", detail: "校验身份、已有来源、用户画像和幂等键，固定来源快照。", tone: "blue" },
      { title: "提取 Claim / Evidence", detail: "复用或提取这份文档中的主张，校验原文引用。", tone: "green" },
      { title: "启动受限 Agent Run", detail: "在画像范围内检索证据，解释其对问题的支持或反驳关系。", tone: "blue" },
      { title: "组装研究报告", detail: "从数据库解析引用与来源版本，不接收模型编造的引用地址。", tone: "green" },
      { title: "可选实验提议", detail: "只判断固定模板是否适用；提议进入待审批，不在此执行实验。", tone: "warm" },
      { title: "保存与读取", detail: "研究 API 读取同一资源；完整原文复核是另一次显式保存的解读。", tone: "green" },
    ],
    note: "没有可用证据可以以 INCONCLUSIVE 结束；下游提议失败不应抹掉已经形成的证据报告。",
    caption: "图 02 · 工作流阅读示意。研究锚点、实际引用与可选实验提议是不同关系。",
  },
  loop: {
    title: "代码推进循环，模型在限定位置做语义判断",
    introduction: "这是当前默认 Spring AI 路径，不将 Loop 协议能表达的所有动作都算作模型自主动作。",
    steps: [
      { title: "代码检查剩余额度", detail: "确认步数、deadline、用量与租约等执行条件。", tone: "green" },
      { title: "代码决定首次检索", detail: "尚无观察时搜索证据；没有证据时确定性返回证据不足。", tone: "green" },
      { title: "模型判断候选", detail: "有证据时读取限定候选，返回立场、回答和候选引用 ID。", tone: "blue" },
      { title: "代码验证与记账", detail: "解析协议、拒绝未知引用，保存实际用量、结果与运行阶段。", tone: "green" },
      { title: "推进、恢复或终止", detail: "按已分类失败与剩余预算继续，或明确完成、失败、耗尽。", tone: "warm" },
    ],
    note: "恢复回到已保存阶段，不是无限重新调用。模型给出 STOP 也必须通过程序校验；缺失供应商用量不能记成零。",
    caption: "图 03 · 默认执行路径的责任示意。Checkpoint、Trace 和受限恢复共同约束这条路径。",
  },
  context: {
    title: "已保存的资料，经过选择才成为一次模型输入",
    introduction: "数据库有材料，不等于这次模型调用已经看到全部材料。",
    steps: [
      { title: "文档与证据库", detail: "保留来源快照、版本、主张与引用；它们是持久化记录。", tone: "green" },
      { title: "检索返回观察 ID", detail: "搜索限定画像范围的证据，形成这次运行的观察集合。", tone: "green" },
      { title: "Resolver 解析候选", detail: "按观察 ID 与画像版本读回材料，缺失或越界时拒绝。", tone: "green" },
      { title: "序列化为 JSON 数据", detail: "组合问题、预算和候选；外部文字不取得系统指令权限。", tone: "blue" },
      { title: "模型判断与引用检查", detail: "回答只能使用允许的候选；代码再次核对返回的引用。", tone: "warm" },
    ],
    note: "完整原文复核走另一条显式路径，读取该研究绑定的来源全文；它仍未自动追读链接、PR、源码或测试。",
    caption: "图 04 · Agent 决策上下文的形成过程，不是全文已被模型永久记忆的声明。",
  },
  validation: {
    title: "每一种检查，只承担自己能证明的部分",
    introduction: "下面是互相补充的检查面，不是自动升级的置信分数。",
    steps: [
      { title: "来源身份", detail: "这段材料来自哪份快照、哪个版本，何时被保存？", tone: "green" },
      { title: "程序约束", detail: "引用是否匹配、ID 是否允许、结构与状态是否有效？", tone: "green" },
      { title: "语义判断", detail: "引用是否真正支持问题中的命题，解释有没有越过材料范围？", tone: "blue" },
      { title: "独立验证", detail: "按独立依据、明确环境和输入，检查一项有限的行为声明。", tone: "warm" },
    ],
    note: "hash 和引用检查不能代替语义评审；模型解释不能代替实验；固定样本通过也不覆盖任意输入。",
    caption: "图 05 · 报告质量的四个检查面。当前研究样本没有执行独立实验。",
  },
  "deep-research": {
    title: "下一条拟议链路：让证据缺口决定下一次阅读",
    introduction: "本图是后续设计目标，在本专题固定的已合并基线中尚未实施。",
    steps: [
      { title: "拆解具体问题", detail: "明确要解释的机制，以及现有材料能回答和不能回答的部分。", tone: "blue" },
      { title: "记录证据缺口", detail: "将缺少的规则、版本或行为依据写成可检查的研究需求。", tone: "warm" },
      { title: "受控补读材料", detail: "在允许的来源、权限与预算内读取相关文档、PR、源码或测试。", tone: "green" },
      { title: "对照并解释", detail: "区分直接证据、推断与反证，说明代码与模型分工和适用条件。", tone: "blue" },
      { title: "保存有限结论", detail: "形成研发建议和未知边界；不足时停止并明确缺口。", tone: "warm" },
    ],
    note: "补读可以回到问题或缺口；停止条件由预算与证据范围约束。此图不赋予任意抓取或外部代码执行权限。",
    caption: "图 06 · 待实施的主动补证据方向，不是已有功能或已完成实验的执行轨迹。",
  },
};

export function EvidenceLabDiagram({ kind }: { kind: EvidenceLabDiagramKind }) {
  const diagram = diagrams[kind];
  return <figure className="rea-diagram rea-diagram--pipeline" aria-label={diagram.title}>
    <div className="rea-diagram-heading"><span>Agent Evidence Lab</span><strong>{diagram.title}</strong></div>
    <p className="rea-diagram-introduction">{diagram.introduction}</p>
    <ol className="rea-diagram-flow">
      {diagram.steps.map((step, index) => <li className={`rea-diagram-step rea-diagram-step--${step.tone}`} key={step.title}>
        <span className="rea-diagram-number">{String(index + 1).padStart(2, "0")}</span><strong>{step.title}</strong><p>{step.detail}</p>
        {index < diagram.steps.length - 1 ? <svg className="rea-diagram-connector" viewBox="0 0 24 16" width="24" height="16" aria-hidden="true" focusable="false"><path d="M2 8h18M14 2l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg> : null}
      </li>)}
    </ol>
    <p className="rea-diagram-note">{diagram.note}</p><figcaption>{diagram.caption}</figcaption>
  </figure>;
}
