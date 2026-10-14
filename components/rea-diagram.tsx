export type ReaDiagramKind = "roles" | "pipeline" | "verification" | "pairing" | "data-flow";

type DiagramStep = { title: string; detail: string; tone: "blue" | "green" | "warm" };
type Diagram = {
  number: string;
  label: string;
  title: string;
  introduction: string;
  steps: DiagramStep[];
  note: string;
  caption: string;
  connectedSteps?: boolean;
};

const diagrams: Record<Exclude<ReaDiagramKind, "pairing">, Diagram> = {
  roles: {
    number: "01", label: "分工图：宿主 Agent、REA 与分析工具", title: "AI 组织调查，工具接触目标",
    introduction: "读图方向：从调查意图走向实际目标。观察结果沿工具链返回，而不是由模型补齐。",
    steps: [
      { title: "宿主 Agent", detail: "模型解释与选择；Harness 管理循环、上下文和权限。", tone: "blue" },
      { title: "REA 工具层", detail: "校验请求，绑定目标，组织分析并保留证据。", tone: "green" },
      { title: "分析器与观察器", detail: "解析器、原生引擎，或选定的运行时观察路径。", tone: "warm" },
      { title: "目标产物与环境", detail: "实际文件、指定映像，或已授权的运行场景。", tone: "warm" },
    ],
    note: "返回路径：观察结果 → Evidence → 宿主上下文 → 下一步查询。",
    caption: "图 01 · 职责边界示意。REA 不是自带通用模型循环的完整 Agent；静态读取与主动执行的权限也不同。",
  },
  pipeline: {
    number: "02", label: "流程图：分析请求怎样成为可读取的证据", title: "一次请求，经过六个可检查的环节",
    introduction: "以 JavaScript 静态分析为例：先固定对象，再产生材料，最后按问题读取。",
    steps: [
      { title: "CLI / MCP 入口", detail: "明确操作、输入、目标，以及本次请求的效果。", tone: "blue" },
      { title: "契约与参数校验", detail: "在进入工作流之前检查请求边界。", tone: "blue" },
      { title: "应用工作流", detail: "组织产物读取、分析、取消与部分失败处理。", tone: "green" },
      { title: "Provider / Worker", detail: "连接适用的解析器或引擎；不是让模型猜字节。", tone: "warm" },
      { title: "图与 Evidence", detail: "绑定来源、关系、覆盖、限制与未知，保留完整记录。", tone: "green" },
      { title: "摘要 / 选定视图", detail: "交付当前问题需要的材料，供宿主继续调查。", tone: "blue" },
    ],
    note: "失败是结果的一部分：部分观察不能包装成完整分析，视图读完也不等于覆盖完整。",
    caption: "图 02 · 固定源码的分层阅读示意，不是一次运行的执行追踪。CLI 与 MCP 的状态生命周期仍需分别处理。",
  },
  verification: {
    number: "03", label: "验证图：观察、假设与独立验收", title: "解释不是终点，还要接受外部检验",
    introduction: "这是一条研究方法链，不是 confidence 从低到高的等级表。每一步都可能发现反证。",
    steps: [
      { title: "工具材料", detail: "来源、位置、参数与覆盖明确；静态关系和运行观察分别记录。", tone: "green" },
      { title: "解释与候选", detail: "模型提出可区分的假设或实现，不把未知补成事实。", tone: "blue" },
      { title: "独立验收", detail: "按事先约定的输入、环境与 oracle，检查有限声明。", tone: "warm" },
    ],
    note: "验收依据：参考结果或规范应与候选解释区分，不能只用模型自己生成的预期来确认自己。",
    caption: "图 03 · 方法与结果边界。失败应修正解释；证据不足保留 unknown；通过也只覆盖已声明条件。",
  },
  "data-flow": {
    number: "05", label: "数据流图：目标分析、模型请求与公开报告", title: "三条数据流，分别确认边界",
    introduction: "下面是三个独立检查面，不是一条承诺全程本地的流水线。",
    steps: [
      { title: "目标文件 → 实际分析引擎", detail: "确认解析器或引擎在哪里运行、是否联网，以及目标字节是否离开本机。", tone: "green" },
      { title: "工具结果 → 宿主 → 模型请求", detail: "远端模型可能收到字符串、伪代码与路径；检查实际发送内容和提供方数据政策。", tone: "blue" },
      { title: "研究记录 → 公开报告", detail: "公开前审查原始输出、截图与引用；JSON 和 gitignore 都不会自动脱敏。", tone: "warm" },
    ],
    connectedSteps: false,
    note: "第一条留在本地，不能推出第二条和第三条也留在本地。",
    caption: "图 05 · 按实际配置核查的三类数据边界示意，不是本轮新增的网络流量实测。",
  },
};

function Connector() {
  return <svg className="rea-diagram-connector" viewBox="0 0 24 16" width="24" height="16" aria-hidden="true" focusable="false"><path d="M2 8h18M14 2l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function ReaDiagram({ kind }: { kind: ReaDiagramKind }) {
  if (kind === "pairing") {
    return <figure className="rea-diagram rea-diagram--pairing" aria-label="配对图：返回形状中的匹配与未知">
      <div className="rea-diagram-heading"><span>FIG. 04</span><strong>配不上对，不等于已证明删除</strong></div>
      <p className="rea-diagram-introduction">根据样本源码与实际比较整理的示意：两个 variant 已配对，一个左侧 variant 保留为未知。</p>
      <table className="rea-pairing-table" aria-label="两版返回形状的配对示意">
        <thead><tr><th scope="col">正确版</th><th scope="col">缺陷版</th><th scope="col">比较结果</th></tr></thead>
        <tbody>
          <tr><td>成功<br /><code>success</code></td><td>成功<br /><code>success</code></td><td>配对</td></tr>
          <tr><td>失败<br /><code>failed</code></td><td>失败<br /><code>failed</code></td><td>配对</td></tr>
          <tr><td>取消<br /><code>idle</code></td><td>无确定对应</td><td><code>unknown</code></td></tr>
        </tbody>
      </table>
      <ul className="rea-pairing-summary" aria-label="实际比较摘要"><li>added <strong>0</strong></li><li>removed <strong>0</strong></li><li>changed <strong>0</strong></li><li>unknown <strong>1</strong></li></ul>
      <p className="rea-diagram-note">未配对的依据不足，不能直接改写为 removed；同样也不能只读三个零就宣称没有变化。</p>
      <figcaption>图 04 · 配对示意不等于运行轨迹，也不表示工具独立发现了取消故障。行为差异由样本源码和冻结测试另行核对。</figcaption>
    </figure>;
  }
  const diagram = diagrams[kind];
  return (
    <figure className={`rea-diagram rea-diagram--${kind}`} aria-label={diagram.label}>
      <div className="rea-diagram-heading"><span>FIG. {diagram.number}</span><strong>{diagram.title}</strong></div>
      <p className="rea-diagram-introduction">{diagram.introduction}</p>
      <ol className="rea-diagram-flow">
        {diagram.steps.map((step, index) => <li className={`rea-diagram-step rea-diagram-step--${step.tone}`} key={step.title}>
          <span className="rea-diagram-number">{String(index + 1).padStart(2, "0")}</span>
          <strong>{step.title}</strong><p>{step.detail}</p>
          {diagram.connectedSteps !== false && index < diagram.steps.length - 1 ? <Connector /> : null}
        </li>)}
      </ol>
      <p className="rea-diagram-note">{diagram.note}</p>
      {kind === "verification" ? <ul className="rea-diagram-outcomes" aria-label="验收结果的三种处理"><li>满足范围内条件</li><li>反证或失败 → 修正</li><li>证据不足 → 保留未知</li></ul> : null}
      <figcaption>{diagram.caption}</figcaption>
    </figure>
  );
}
