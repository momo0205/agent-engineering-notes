"use client";

import { useEffect, useState } from "react";
import {
  ALGORITHM_PROGRESS_CHANGE_EVENT,
  emptyProgress,
  readProgress,
  writeProgress,
  type ProgressV1,
  type StorageLike,
} from "../lib/algorithm-progress";
import type { SelfCheckQuestion } from "../lib/content/algorithm-foundations-topic";

export type { SelfCheckQuestion } from "../lib/content/algorithm-foundations-topic";

export function createLatestMountedCommitter<Result>(commit: (result: Result) => void) {
  let latestRequestId = 0;
  let mounted = false;

  return {
    mount() {
      mounted = true;
    },
    dispose() {
      mounted = false;
    },
    begin() {
      const requestId = latestRequestId + 1;
      latestRequestId = requestId;

      return (result: Result) => {
        if (mounted && latestRequestId === requestId) commit(result);
      };
    },
  };
}

function browserStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function toggleMasteredCheck(progress: ProgressV1, chapter: string, questionId: string): ProgressV1 {
  const masteredChecks = progress.masteredChecks[chapter] ?? [];
  const nextMasteredChecks = masteredChecks.includes(questionId)
    ? masteredChecks.filter((id) => id !== questionId)
    : [...masteredChecks, questionId];

  return {
    ...progress,
    masteredChecks: {
      ...progress.masteredChecks,
      [chapter]: nextMasteredChecks,
    },
  };
}

export function PaperSelfCheck({
  chapter,
  questions,
  command,
  progress,
  onProgressChange,
  storage,
}: {
  chapter: string;
  questions: readonly SelfCheckQuestion[];
  command: string;
  progress?: ProgressV1;
  onProgressChange?: (nextProgress: ProgressV1) => void;
  storage?: StorageLike;
}) {
  const [storedProgress, setStoredProgress] = useState<ProgressV1>(emptyProgress);
  const [copyStatus, setCopyStatus] = useState("");
  const [copyCommitter] = useState(() => createLatestMountedCommitter(setCopyStatus));
  const currentProgress = progress ?? storedProgress;

  useEffect(() => {
    if (progress !== undefined) return;

    const activeStorage = storage ?? browserStorage();
    const restoreTimer = activeStorage
      ? window.setTimeout(() => setStoredProgress(readProgress(activeStorage)), 0)
      : null;

    return () => {
      if (restoreTimer !== null) window.clearTimeout(restoreTimer);
    };
  }, [progress, storage]);

  useEffect(() => {
    copyCommitter.mount();
    return () => copyCommitter.dispose();
  }, [copyCommitter]);

  const updateProgress = (nextProgress: (current: ProgressV1) => ProgressV1) => {
    if (progress === undefined) {
      const activeStorage = storage ?? browserStorage();
      const stored = activeStorage ? readProgress(activeStorage) : storedProgress;
      const next = nextProgress(stored);
      setStoredProgress(next);
      if (activeStorage) writeProgress(activeStorage, next);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent<ProgressV1>(ALGORITHM_PROGRESS_CHANGE_EVENT, { detail: next }));
      }
      onProgressChange?.(next);
      return;
    }
    onProgressChange?.(nextProgress(currentProgress));
  };

  const copyCommand = async () => {
    const commit = copyCommitter.begin();

    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(command);
      commit("已复制命令");
    } catch {
      commit("复制失败，请手动选择");
    }
  };

  const mastered = currentProgress.masteredChecks[chapter] ?? [];

  return (
    <section className="paper-self-check" aria-labelledby={`paper-self-check-${chapter}`}>
      <h2 id={`paper-self-check-${chapter}`}>自测与下一步</h2>
      <p>先自己回答，再展开答案核对；标记“已掌握”只记录在当前浏览器的自测进度中。</p>
      {questions.map((question) => {
        const checkboxId = `paper-self-check-${chapter}-${question.id}`;
        return (
          <div key={question.id} className="paper-self-check-question">
            <details>
              <summary>{question.prompt}</summary>
              <p>{question.answer}</p>
            </details>
            <label htmlFor={checkboxId}>
              <input
                id={checkboxId}
                type="checkbox"
                checked={mastered.includes(question.id)}
                onChange={() => updateProgress((current) => toggleMasteredCheck(current, chapter, question.id))}
              />
              我已能回答：{question.prompt}
            </label>
          </div>
        );
      })}
      <button type="button" onClick={copyCommand}>复制复现命令</button>
      <p role="status" aria-live="polite">{copyStatus}</p>
    </section>
  );
}
