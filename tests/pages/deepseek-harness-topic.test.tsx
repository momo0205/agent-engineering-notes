import { render, screen } from "@testing-library/react";
import DeepSeekHarnessTopicPage from "../../app/topics/deepseek-harness/page";

describe("DeepSeek Harness topic", () => {
  it("presents the versioned source review and a bounded reading path", () => {
    render(<DeepSeekHarnessTopicPage />);

    expect(screen.getByRole("heading", { name: "DeepSeek Harness 源码与能力边界" })).toBeInTheDocument();
    expect(screen.getByText(/aa8262ec/)).toBeInTheDocument();
    expect(screen.getByText(/Developer Preview/)).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(7);
    expect(screen.getByRole("link", { name: /先读能力边界/ })).toHaveAttribute(
      "href",
      "/topics/deepseek-harness/capability-boundary",
    );
  });

  it("states that the existing system will not be replaced", () => {
    render(<DeepSeekHarnessTopicPage />);
    expect(screen.getByText(/不替换 Agent Evidence Lab/)).toBeInTheDocument();
  });

  it("turns the A-stock strategy decision into a three-part case study", () => {
    render(<DeepSeekHarnessTopicPage />);

    expect(screen.getByRole("link", { name: "一个系统什么时候需要 Harness" })).toHaveAttribute(
      "href",
      "/topics/deepseek-harness/harness-fit",
    );
    expect(screen.getByRole("link", { name: "从工具到研究 Agent：不要跳过中间层" })).toHaveAttribute(
      "href",
      "/topics/deepseek-harness/tool-to-agent",
    );
    expect(screen.getByRole("link", { name: "设计一个可撤回的 DSH 实验" })).toHaveAttribute(
      "href",
      "/topics/deepseek-harness/reversible-poc",
    );
  });
});
