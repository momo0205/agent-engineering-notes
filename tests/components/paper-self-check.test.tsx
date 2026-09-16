import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, vi } from "vitest";
import { PaperSelfCheck, type SelfCheckQuestion } from "../../components/paper-self-check";
import { algorithmFoundationsChapters } from "../../lib/content/algorithm-foundations-topic";
import { emptyProgress } from "../../lib/algorithm-progress";

const questions: readonly SelfCheckQuestion[] = [
  {
    id: "degradation-vs-overfitting",
    prompt: "退化问题与过拟合在观测上有什么不同？",
    answer: "退化可表现为更深模型连训练误差也更高；过拟合则通常是训练集表现较好而验证表现变差。两者仍需结合具体实验判断。",
  },
  {
    id: "residual-function",
    prompt: "F(x) + x 中的 F 为什么被称为残差？",
    answer: "F 学习相对输入 x 的补充变换；恒等路径保留 x，不表示网络不再需要学习。",
  },
];

const command = "python3 code/resnet/plain_vs_residual.py --smoke --offline --output-dir /tmp/paper-deep-dive-resnet";

afterEach(() => cleanup());

describe("PaperSelfCheck", () => {
  it("ships closed native answer disclosures in server-rendered HTML", () => {
    const html = renderToStaticMarkup(
      <PaperSelfCheck chapter="resnet" questions={questions} command={command} />,
    );

    expect(html).toContain("<details>");
    expect(html).not.toContain("<details open");
    expect(html).toContain(questions[0].prompt);
    expect(html).toContain(questions[0].answer);
  });

  it("reveals an answer only after its question-named native summary is disclosed", () => {
    render(<PaperSelfCheck chapter="resnet" questions={questions} command={command} />);

    const answer = screen.getByText(questions[0].answer);
    expect(answer).not.toBeVisible();
    fireEvent.click(screen.getByText(questions[0].prompt, { selector: "summary" }));
    expect(answer).toBeVisible();
  });

  it("reports a mastered question through the provided v1 progress callback", () => {
    const onProgressChange = vi.fn();
    render(
      <PaperSelfCheck
        chapter="resnet"
        questions={questions}
        command={command}
        progress={emptyProgress()}
        onProgressChange={onProgressChange}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: `我已能回答：${questions[0].prompt}` }));

    expect(onProgressChange).toHaveBeenCalledWith({
      version: 1,
      completed: {},
      masteredChecks: { resnet: ["degradation-vs-overfitting"] },
    });
  });

  it("copies the exact reproduction command and announces success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });

    try {
      render(<PaperSelfCheck chapter="resnet" questions={questions} command={command} />);
      fireEvent.click(screen.getByRole("button", { name: "复制复现命令" }));

      await waitFor(() => expect(writeText).toHaveBeenCalledWith(command));
      expect(screen.getByRole("status")).toHaveTextContent("已复制命令");
    } finally {
      if (originalClipboard) Object.defineProperty(navigator, "clipboard", originalClipboard);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it.each(["missing", "rejected"])("does not crash when clipboard access is %s", async (mode) => {
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: mode === "missing" ? undefined : { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });

    try {
      render(<PaperSelfCheck chapter="resnet" questions={questions} command={command} />);
      fireEvent.click(screen.getByRole("button", { name: "复制复现命令" }));

      await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("复制失败，请手动选择"));
    } finally {
      if (originalClipboard) Object.defineProperty(navigator, "clipboard", originalClipboard);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });
});

describe("algorithm paper self-check data", () => {
  it("keeps a practical, stable question set for every paper chapter", () => {
    expect(algorithmFoundationsChapters.map(({ slug, selfChecks }) => [slug, selfChecks.map(({ id }) => id)])).toEqual([
      ["resnet", ["degradation-vs-overfitting", "residual-function", "smoke-scope"]],
      ["transformer", ["attention-roles", "attention-scaling", "residual-comparison"]],
      ["ddpm", ["forward-reverse-information", "smoke-evidence-scope", "architecture-claims"]],
    ]);
    expect(algorithmFoundationsChapters.flatMap(({ selfChecks }) => selfChecks.map(({ answer }) => answer))).not.toContain("");
  });
});
