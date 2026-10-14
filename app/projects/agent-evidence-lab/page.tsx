import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Evidence Lab",
  description: "研究 Agent 的 Agent：理解循环、上下文与工具机制，形成可追溯、可保存的研究报告和研发建议。",
  alternates: { canonical: "/projects/agent-evidence-lab" },
};

export default function ProjectPage() {
  return (
    <main id="main-content">
      <header className="page-intro project-intro">
        <p className="eyebrow">Current project</p>
        <h1>Agent Evidence Lab</h1>
        <p>做一个“研究 Agent 的 Agent”，理解机制，追溯证据，形成自己的研发判断。</p>
        <p>状态核对：<time dateTime="2026-10-14">2026-10-14</time></p>
      </header>

      <section className="project-status" aria-labelledby="project-status-title">
        <div>
          <p className="section-kicker">进度</p>
          <h2 id="project-status-title">M0–M3 已完成限定范围验收</h2>
          <p>M4 已有固定 A/B 实验、研究 API 与个人报告切片。完整 M4/M5 仍未关闭，当前运行在本机。</p>
        </div>
        <div className="evidence-block">
          <strong>可读、可追溯、可保存</strong>
          <p>最新完整原文复核已验证保存与重启复用；小样本和固定任务的结果不能外推为生产可靠性。</p>
        </div>
      </section>

      <div className="article-body">
        <section aria-labelledby="purpose-title">
          <h2 id="purpose-title">为什么要研究 Agent</h2>
          <p>
            我想知道一个 Agent 为什么能完成任务，又为什么会停错、引用错、恢复失败。
            Agent loop 如何观察、决策、行动和验证？上下文如何选取？工具调用怎样受约束？
            Harness 怎样把模型的判断接到可检查的执行过程？尤其要讲清楚：哪些职责交给代码，哪些交给大模型。
          </p>
          <p>
            产品的长期目标，是持续研究 Agent 工程，产出可追溯、可读、可保存的研究报告与研发建议，
            最终作为长期服务运行。研究材料要支持机制解释、工程借鉴和未知边界，不能只停留在 Release 新闻摘要。
            产品也不提供任意外部代码执行。
          </p>
          <p>目标闭环：来源 → 信号 → 主张 → 证据 → 实验 → 结论 → 决策。当前只打通了其中受限的研究与实验切片。</p>
        </section>

        <section aria-labelledby="responsibilities-title">
          <h2 id="responsibilities-title">代码与模型分别负责什么</h2>
          <p>
            <strong>代码负责执行边界和记录。</strong>
            来源白名单、鉴权、工具权限、调用次数、步数、超时和预算由服务端控制；
            检索与工具执行走受限接口。代码从已保存的来源快照匹配引用，计算原文位置与 hash，
            校验结构并保存报告、版本和运行轨迹。固定实验的指标与比较也由代码计算。
          </p>
          <p>
            <strong>模型负责语义理解和解释。</strong>
            在允许的任务与工具范围内判断证据和问题的关系，提出行动或实验建议，解释机制、
            工程启示与不确定性。模型提出的决策仍要经过代码校验；研究流程中的实验建议只进入待审批状态。
          </p>
          <p>
            <strong>引用可追溯，不代表结论已独立验证。</strong>
            匹配到原文只能说明报告确实引用了这份材料。机制解释、兼容性判断和研发建议还需要更充分的文档、
            PR、源码、测试或受控实验。外部内容始终作为不可信数据处理。
          </p>
        </section>

        <section aria-labelledby="completed-title">
          <h2 id="completed-title">已经验证的能力</h2>
          <ul>
            <li><strong>服务基础：</strong>Java/Spring AI 本机服务、DeepSeek 接入、PostgreSQL/Flyway、鉴权、Docker 与无密钥 CI。</li>
            <li><strong>来源采集：</strong>三个白名单仓库的 GitHub Releases 采集、去重和来源版本保存。</li>
            <li><strong>证据处理：</strong>Claim/Evidence 提取、全文检索、来源引用；缺乏证据时返回证据不足状态。</li>
            <li><strong>受限 Agent Loop：</strong>观察、决策、行动、验证、恢复与停止；预算和停止条件、持久化恢复、调用轨迹已有固定任务范围验收。</li>
            <li><strong>研究 API 与可读报告：</strong>从已保存 Signal 启动研究，保存并读取同一研究资源；页面展示问题、发现、解释、工程启示、引用和后续建议。</li>
            <li><strong>显式原文复核：</strong>读取该研究绑定的完整已保存原文，单独生成补充解读；按研究 ID 与提示版本保存，重复读取、同版本重复请求和重启后复用已有结果。</li>
            <li><strong>固定 Prompt-strategy A/B 切片：</strong>版本化计划、人工审批、固定五例与两臂十次子运行、确定性指标和恢复已通过本地固定夹具验收。</li>
          </ul>
          <p>
            最新本地 Java 验证记录为 418 个单元测试、246 个集成测试，0 失败/错误，5 个条件跳过；
            报告页面 Node 测试 11/11。PR #11 已于 2026-10-14 合并到 main，test/image CI 均成功。
            这些记录描述本地固定任务与单一真实样本的验收，不代表任意输入都能得到可靠结论。
          </p>
        </section>

        <section aria-labelledby="boundaries-title">
          <h2 id="boundaries-title">当前真实能力边界</h2>
          <p>目前的三个采集来源是：</p>
          <ul>
            <li><a href="https://github.com/openai/openai-agents-python">openai/openai-agents-python</a></li>
            <li><a href="https://github.com/spring-projects/spring-ai">spring-projects/spring-ai</a></li>
            <li><a href="https://github.com/langchain4j/langchain4j">langchain4j/langchain4j</a></li>
          </ul>
          <p>
            三者目前都只采集 GitHub Releases。复核的“完整原文”是已经保存的来源快照，
            不意味着自动读过它链接的文档、关联 PR、源码或测试。问题驱动的主动补证据链路尚未实现。
          </p>
          <p>
            固定 A/B 能力是另一项已验收的小切片，不能当成本次 Release 研究做过实验的证明。
            已有固定样本评测与有限对抗探针，也不能代表全面语义质量或系统性安全验证。
            本机可用、Docker 可构建和 PR 已合并，仍不等于服务器长期部署或生产运维就绪。
          </p>
        </section>

        <section aria-labelledby="latest-report-title">
          <h2 id="latest-report-title">最新报告切片：完整原文复核</h2>
          <p>
            本次真实回归样本研究的是 <strong>OpenAI Agents SDK（Python）的 v0.22.0 发布</strong>。
            v0.22.0 是被研究 SDK 的版本，不是 Agent Evidence Lab 的产品版本，也不是产品的固定研究范围。
          </p>
          <p>完整来源快照复核得到三项发现：</p>
          <ol>
            <li><strong>工具输出防护：</strong>结合来源引用说明工具输出与 Agent 执行边界的关系。</li>
            <li><strong>RunState 用量隔离：</strong>解释用量归属和隔离对运行状态、计量的工程意义。</li>
            <li><strong>Sandbox 补丁校验：</strong>补回初次提取遗漏的标题级证据；具体规则细节标为 PARTIAL，不能据此宣称兼容性行为或预测升级失败。</li>
          </ol>
          <p>
            补充解读已保存，重复请求与应用重启后可读回同一结果。初次报告没有改写，
            本次研究的实际实验运行数仍为 0。以上解释与建议来自模型解读，尚未由独立实验验证。
          </p>
        </section>

        <section aria-labelledby="remaining-title">
          <h2 id="remaining-title">仍待完成</h2>
          <ul>
            <li>遇到问题或证据不足时，主动追读文档、关联 PR、源码和测试的深度研究。</li>
            <li>工程文章、官方文档、论文等其他来源的接入。</li>
            <li>通用受控实验与 CPU、内存、网络、命令等沙箱边界。</li>
            <li>全面语义质量评测与系统性安全验证。</li>
            <li>备份恢复演练与服务器长期部署。</li>
          </ul>
          <p>完整 M4/M5 和“研究 Agent 的 Agent”产品目标仍未完成；当前成果是有明确验收范围的本机研究切片。</p>
        </section>

        <section aria-labelledby="next-title">
          <h2 id="next-title">下一条主线：问题驱动、主动补证据</h2>
          <p>
            已认可的下一方向，是先补一条小而完整的深度研究链路：从一个具体工程问题出发，
            识别现有证据的缺口，再在受控范围内追读必要材料，形成机制解释、代码与模型分工、可借鉴做法和未知边界。
            这个方向尚未实施。
          </p>
          <p>拟议验收目标：</p>
          <ol>
            <li>能指出原有证据为什么不足，并记录每次补读的理由、来源和版本。</li>
            <li>在允许的来源、工具和预算内完成一条问题到补充证据再到研究报告的链路。</li>
            <li>报告区分直接证据、模型推断和仍未知的内容，给出机制解释与适用范围明确的研发建议。</li>
            <li>结果可追溯、可读、可保存、可重读；证据仍不足时明确保留未知，不制造完成结论。</li>
          </ol>
          <p>下一阶段围绕这条研究链路推进；页面样式和大规模仓库扩展都不是当前主线。</p>
        </section>
      </div>
    </main>
  );
}
