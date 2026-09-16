import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AlgorithmProgress } from "../../components/algorithm-progress";
import {
  ALGORITHM_PROGRESS_STORAGE_KEY,
  emptyProgress,
  readProgress,
  resetProgress,
  writeProgress,
  type StorageLike,
} from "../../lib/algorithm-progress";

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

function storageWithProgress(value: string) {
  const storage = new MemoryStorage();
  storage.setItem(ALGORITHM_PROGRESS_STORAGE_KEY, value);
  return storage;
}

describe("algorithm study progress storage", () => {
  it("restores only the exact v1 progress schema", () => {
    const storage = storageWithProgress(JSON.stringify({
      version: 1,
      completed: { resnet: ["question", "skim"] },
      masteredChecks: { resnet: ["residual-path"] },
    }));

    expect(readProgress(storage)).toEqual({
      version: 1,
      completed: { resnet: ["question", "skim"] },
      masteredChecks: { resnet: ["residual-path"] },
    });
  });

  it.each([
    "not json",
    JSON.stringify({ version: 2, completed: {}, masteredChecks: {} }),
    JSON.stringify({ version: 1, completed: { resnet: ["free text"] }, masteredChecks: {} }),
    JSON.stringify({ version: 1, completed: {}, masteredChecks: {}, extra: true }),
  ])("safely resets malformed or incompatible stored data without touching unrelated keys", (value) => {
    const storage = storageWithProgress(value);
    storage.setItem("unrelated", "keep-me");

    expect(readProgress(storage)).toEqual(emptyProgress());
    expect(storage.getItem(ALGORITHM_PROGRESS_STORAGE_KEY)).toBeNull();
    expect(storage.getItem("unrelated")).toBe("keep-me");
  });

  it("degrades safely when storage reads, writes, or resets throw", () => {
    const throwingStorage: StorageLike = {
      getItem: () => { throw new Error("security"); },
      setItem: () => { throw new Error("quota"); },
      removeItem: () => { throw new Error("security"); },
    };

    expect(readProgress(throwingStorage)).toEqual(emptyProgress());
    expect(writeProgress(throwingStorage, emptyProgress())).toBe(false);
    expect(() => resetProgress(throwingStorage)).not.toThrow();
  });

  it("writes only valid progress into its own namespaced key", () => {
    const storage = new MemoryStorage();
    storage.setItem("unrelated", "keep-me");

    expect(writeProgress(storage, {
      version: 1,
      completed: { ddpm: ["experiment"] },
      masteredChecks: {},
    })).toBe(true);
    expect(readProgress(storage)).toEqual({
      version: 1,
      completed: { ddpm: ["experiment"] },
      masteredChecks: {},
    });
    expect(storage.getItem("unrelated")).toBe("keep-me");
  });
});

describe("AlgorithmProgress", () => {
  it("renders exactly six stable checklist steps for each paper chapter", () => {
    const storage = new MemoryStorage();
    render(<AlgorithmProgress chapter="resnet" chapterName="ResNet" storage={storage} />);

    const checks = screen.getAllByRole("checkbox");
    expect(checks).toHaveLength(6);
    expect(checks.map((check) => check.getAttribute("data-step-id"))).toEqual([
      "question", "skim", "derive", "reproduce", "experiment", "self-check",
    ]);
  });

  it("updates a checklist step and synchronizes the homepage summary", async () => {
    const storage = new MemoryStorage();
    render(
      <>
        <AlgorithmProgress storage={storage} />
        <AlgorithmProgress chapter="resnet" chapterName="ResNet" storage={storage} />
      </>,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "带着核心问题开始" }));

    await waitFor(() => expect(screen.getByText("1 / 18 个学习步骤已完成")).toBeInTheDocument());
    expect(readProgress(storage).completed).toEqual({ resnet: ["question"] });
  });

  it("keeps the current render interactive when browser storage is unavailable", async () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: () => { throw new Error("blocked"); },
    });

    try {
      render(
        <>
          <AlgorithmProgress />
          <AlgorithmProgress chapter="ddpm" chapterName="DDPM" />
        </>,
      );

      const check = screen.getByRole("checkbox", { name: "带着核心问题开始" });
      fireEvent.click(check);

      await waitFor(() => expect(check).toBeChecked());
      expect(screen.getByText("1 / 18 个学习步骤已完成")).toBeInTheDocument();
      expect(screen.getByText("进度仅保存在当前浏览器")).toBeInTheDocument();
    } finally {
      if (originalDescriptor) Object.defineProperty(window, "localStorage", originalDescriptor);
    }
  });
});
