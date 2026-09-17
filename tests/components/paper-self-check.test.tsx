import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, expect, vi } from "vitest";
import {
  createLatestMountedCommitter,
  PaperSelfCheck,
  type SelfCheckQuestion,
} from "../../components/paper-self-check";
import { algorithmFoundationsChapters } from "../../lib/content/algorithm-foundations-topic";
import { ALGORITHM_PROGRESS_STORAGE_KEY, emptyProgress, type StorageLike } from "../../lib/algorithm-progress";

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

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

function deferred() {
  let resolve!: () => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

function replaceClipboard(clipboard: Pick<Clipboard, "writeText"> | undefined) {
  const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: clipboard });

  return () => {
    if (originalClipboard) Object.defineProperty(navigator, "clipboard", originalClipboard);
    else Reflect.deleteProperty(navigator, "clipboard");
  };
}

afterEach(() => cleanup());

describe("PaperSelfCheck", () => {
  it("presents the self-check as a readable card with separated interactive rows", () => {
    const style = document.createElement("style");
    style.textContent = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
    document.head.appendChild(style);

    try {
      const { container } = render(
        <PaperSelfCheck chapter="resnet" questions={questions} command={command} />,
      );
      const section = container.querySelector<HTMLElement>(".paper-self-check");
      const question = container.querySelector<HTMLElement>(".paper-self-check-question");
      const summary = screen.getByText(questions[0].prompt, { selector: "summary" });
      const copyButton = screen.getByRole("button", { name: "复制复现命令" });

      expect(getComputedStyle(section!).paddingTop).toBe("30px");
      expect(getComputedStyle(question!).borderBottomStyle).toBe("solid");
      expect(getComputedStyle(summary).cursor).toBe("pointer");
      expect(getComputedStyle(copyButton).display).toBe("inline-flex");
      expect(getComputedStyle(copyButton).borderRadius).toBe("10px");
    } finally {
      style.remove();
    }
  });

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

  it("persists only the namespaced v1 mastered check and restores it after remount", async () => {
    const storage = new MemoryStorage();
    const originalLocalStorage = Object.getOwnPropertyDescriptor(window, "localStorage");
    const initialProgress = {
      version: 1 as const,
      completed: { resnet: ["question"], transformer: ["skim"] },
      masteredChecks: { transformer: ["attention-scaling"] },
    };
    storage.setItem(ALGORITHM_PROGRESS_STORAGE_KEY, JSON.stringify(initialProgress));
    storage.setItem("unrelated", "keep-me");
    Object.defineProperty(window, "localStorage", { configurable: true, value: storage });

    try {
      const firstRender = render(<PaperSelfCheck chapter="resnet" questions={questions} command={command} />);
      fireEvent.click(screen.getByRole("checkbox", { name: `我已能回答：${questions[0].prompt}` }));

      const persistedProgress = {
        version: 1,
        completed: { resnet: ["question"], transformer: ["skim"] },
        masteredChecks: {
          transformer: ["attention-scaling"],
          resnet: ["degradation-vs-overfitting"],
        },
      };
      expect(storage.getItem(ALGORITHM_PROGRESS_STORAGE_KEY)).toBe(JSON.stringify(persistedProgress));
      expect(storage.getItem("unrelated")).toBe("keep-me");

      firstRender.unmount();
      render(<PaperSelfCheck chapter="resnet" questions={questions} command={command} />);
      await waitFor(() => expect(screen.getByRole("checkbox", { name: `我已能回答：${questions[0].prompt}` })).toBeChecked());
      expect(storage.getItem(ALGORITHM_PROGRESS_STORAGE_KEY)).toBe(JSON.stringify(persistedProgress));
      expect(storage.getItem("unrelated")).toBe("keep-me");
    } finally {
      storage.removeItem(ALGORITHM_PROGRESS_STORAGE_KEY);
      storage.removeItem("unrelated");
      if (originalLocalStorage) Object.defineProperty(window, "localStorage", originalLocalStorage);
    }
  });

  it("copies the exact reproduction command and announces success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const restoreClipboard = replaceClipboard({ writeText });

    try {
      render(<PaperSelfCheck chapter="resnet" questions={questions} command={command} />);
      fireEvent.click(screen.getByRole("button", { name: "复制复现命令" }));

      await waitFor(() => expect(writeText).toHaveBeenCalledWith(command));
      expect(screen.getByRole("status")).toHaveTextContent("已复制命令");
    } finally {
      restoreClipboard();
    }
  });

  it.each(["missing", "rejected"])("does not crash when clipboard access is %s", async (mode) => {
    const restoreClipboard = replaceClipboard(mode === "missing"
      ? undefined
      : { writeText: vi.fn().mockRejectedValue(new Error("denied")) });

    try {
      render(<PaperSelfCheck chapter="resnet" questions={questions} command={command} />);
      fireEvent.click(screen.getByRole("button", { name: "复制复现命令" }));

      await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("复制失败，请手动选择"));
    } finally {
      restoreClipboard();
    }
  });

  it("keeps a newer copy success when an older pending request rejects later", async () => {
    const firstCopy = deferred();
    const writeText = vi.fn()
      .mockReturnValueOnce(firstCopy.promise)
      .mockResolvedValueOnce(undefined);
    const restoreClipboard = replaceClipboard({ writeText });

    try {
      render(<PaperSelfCheck chapter="resnet" questions={questions} command={command} />);
      fireEvent.click(screen.getByRole("button", { name: "复制复现命令" }));
      fireEvent.click(screen.getByRole("button", { name: "复制复现命令" }));

      await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("已复制命令"));
      await act(async () => firstCopy.reject(new Error("late rejection")));
      expect(screen.getByRole("status")).toHaveTextContent("已复制命令");
    } finally {
      restoreClipboard();
    }
  });

  it("keeps a newer missing-clipboard failure when an older pending request succeeds later", async () => {
    const firstCopy = deferred();
    const restoreFirstClipboard = replaceClipboard({ writeText: vi.fn().mockReturnValueOnce(firstCopy.promise) });

    try {
      render(<PaperSelfCheck chapter="resnet" questions={questions} command={command} />);
      fireEvent.click(screen.getByRole("button", { name: "复制复现命令" }));
      restoreFirstClipboard();
      const restoreMissingClipboard = replaceClipboard(undefined);
      try {
        fireEvent.click(screen.getByRole("button", { name: "复制复现命令" }));
        expect(screen.getByRole("status")).toHaveTextContent("复制失败，请手动选择");

        await act(async () => firstCopy.resolve());
        expect(screen.getByRole("status")).toHaveTextContent("复制失败，请手动选择");
      } finally {
        restoreMissingClipboard();
      }
    } finally {
      restoreFirstClipboard();
    }
  });

  it.each(["resolves", "rejects"])("does not commit when a pending copy %s after its owner disposes", async (outcome) => {
    const pendingCopy = deferred();
    const commitObserver = vi.fn();
    const committer = createLatestMountedCommitter(commitObserver);
    committer.mount();
    const commit = committer.begin();
    const completion = pendingCopy.promise.then(
      () => commit("已复制命令"),
      () => commit("复制失败，请手动选择"),
    );

    committer.dispose();
    if (outcome === "resolves") pendingCopy.resolve();
    else pendingCopy.reject(new Error("denied after unmount"));
    await completion;

    expect(commitObserver).not.toHaveBeenCalled();
  });
});

describe("algorithm paper self-check data", () => {
  it("keeps a practical, stable question set for every paper chapter", () => {
    expect(algorithmFoundationsChapters.map(({ slug, selfChecks }) => [slug, selfChecks.map(({ id }) => id)])).toEqual([
      ["resnet", [
        "degradation-vs-overfitting",
        "residual-function",
        "smoke-scope",
        "identity-optimization",
        "projection-shortcut",
        "bottleneck-purpose",
      ]],
      ["transformer", [
        "attention-roles",
        "attention-scaling",
        "residual-comparison",
        "multi-head-shape",
        "position-information",
        "mask-difference",
      ]],
      ["ddpm", [
        "forward-reverse-information",
        "smoke-evidence-scope",
        "architecture-claims",
        "closed-form-forward",
        "simple-loss-boundary",
        "sampling-serial-cost",
      ]],
    ]);
    expect(algorithmFoundationsChapters.flatMap(({ selfChecks }) => selfChecks.map(({ answer }) => answer))).not.toContain("");
  });
});
